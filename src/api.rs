// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//

use diesel::{r2d2::ConnectionManager, PgConnection, QueryDsl, RunQueryDsl};
use futures::{future, FutureExt};
use gotham::{
    handler::{HandlerFuture, IntoResponse},
    middleware::{session::SessionData, Middleware},
    pipeline::{new_pipeline, single_pipeline},
    router::{builder::*, response::ResponseExtender, Router},
    state::{FromState, State},
};
use gotham_derive::{NewMiddleware, StateData, StaticResponseExtender};
use http::{response::Response, status::StatusCode};
use hyper::body;
use log::warn;
use noted_db::DbConnection;
use r2d2::PooledConnection;
use serde_derive::{Deserialize, Serialize};
use serde_json::json;
use std::pin::Pin;

#[derive(Serialize, Deserialize, Default)]
pub struct UserData {
    current_user_id: i32,
}

#[derive(Clone, NewMiddleware)]
struct JsonifyErrors;

impl Middleware for JsonifyErrors {
    fn call<Chain>(self, state: State, chain: Chain) -> Pin<Box<HandlerFuture>>
    where
        Chain: FnOnce(State) -> Pin<Box<HandlerFuture>> + Send + 'static,
    {
        let result = chain(state);

        result
            .then(|result| match result {
                Ok((state, response)) => future::ok((state, response)),
                Err((state, error)) => {
                    warn!("Converting to JSON response");
                    let response_body = json!({
                        "error": format!("{}", error.status()),
                        "details": format!("{:?}", error),
                    });

                    let mut response = error.into_response(&state);

                    *response.body_mut() =
                        hyper::Body::from(serde_json::to_string(&response_body).unwrap());

                    future::ok((state, response))
                }
            })
            .boxed()
    }
}

struct StaticErrorHandler(&'static str);

impl ResponseExtender<hyper::Body> for StaticErrorHandler {
    fn extend(&self, _state: &mut State, response: &mut Response<hyper::Body>) {
        let response_body = json!({
            "error": self.0,
            "code": response.status().as_u16()
        });

        response.headers_mut().insert(
            hyper::header::CONTENT_TYPE,
            hyper::header::HeaderValue::from_static("application/json"),
        );
        *response.body_mut() = hyper::Body::from(serde_json::to_string(&response_body).unwrap());
    }
}

#[derive(Clone, NewMiddleware)]
struct RequireUser;

impl Middleware for RequireUser {
    fn call<Chain>(self, state: State, chain: Chain) -> Pin<Box<HandlerFuture>>
    where
        Chain: FnOnce(State) -> Pin<Box<HandlerFuture>> + Send + 'static,
    {
        if SessionData::<crate::AppData>::borrow_from(&state)
            .user
            .is_some()
        {
            chain(state)
        } else {
            warn!("No user available, refusing request.");
            let resp = crate::error::NotedError::NotLoggedIn.into_json_response(&state);
            future::ok((state, resp)).boxed()
        }
    }
}

fn secure_api() -> Router {
    let (chain, pipelines) =
        single_pipeline(new_pipeline().add(RequireUser).add(JsonifyErrors).build());

    build_router(chain, pipelines, |route| {
        route.add_response_extender(StatusCode::NOT_FOUND, StaticErrorHandler("not found"));

        route.put("/note").to(new_note);
        route.scope("/notes", |route| {
            route.get("/").to(list_notes);
            route.associate("/:id", |assoc| {
                assoc.get().with_path_extractor::<IdParams>().to(read_note);
                assoc
                    .patch()
                    .with_path_extractor::<IdParams>()
                    .to(update_note);
                assoc
                    .delete()
                    .with_path_extractor::<IdParams>()
                    .to(delete_note);
            });
            route
                .put("/:id/tags")
                .with_path_extractor::<IdParams>()
                .to(set_tags);
        });
    })
}

pub fn api() -> Router {
    let (chain, pipelines) = single_pipeline(new_pipeline().add(JsonifyErrors).build());
    build_router(chain, pipelines, |route| {
        route.add_response_extender(
            StatusCode::UNAUTHORIZED,
            StaticErrorHandler("not authorized"),
        );
        route.put("/sign_up").to(sign_up);
        route.post("/sign_in").to(sign_in);
        route.get("/get_user").to(get_user);
        route.post("/sign_out").to(sign_out);
        route.delegate("/secure").to_router(secure_api());
    })
}

fn parse_json<'a, D: serde::Deserialize<'a>>(s: &'a str) -> Result<D, noted_db::error::DbError> {
    Ok(serde_json::from_str(s)?)
}

fn json_response<S: serde::Serialize>(
    s: S,
) -> Result<hyper::http::Response<hyper::Body>, crate::error::NotedError> {
    Ok(Response::builder()
        .header("Content-Type", "application/json")
        .body(hyper::Body::from(serde_json::to_string(&s)?))
        .unwrap())
}

fn body_handler<F>(mut state: State, f: F) -> Pin<Box<HandlerFuture>>
where
    F: 'static
        + Send
        + Fn(
            String,
            &mut State,
        ) -> Result<hyper::http::Response<hyper::Body>, crate::error::NotedError>,
{
    body::to_bytes(hyper::Body::take_from(&mut state))
        .then(move |full_body| match full_body {
            Ok(valid_body) => {
                let body_content = String::from_utf8(valid_body.to_vec()).unwrap();
                let res = match f(body_content, &mut state) {
                    Ok(res) => res,
                    Err(e) => e.into_json_response(&state),
                };
                future::ok((state, res))
            }
            Err(e) => {
                let res = crate::error::NotedError::from(e).into_json_response(&state);
                future::ok((state, res))
            }
        })
        .boxed()
}

fn handler<F>(mut state: State, f: F) -> Pin<Box<HandlerFuture>>
where
    F: 'static
        + Send
        + Fn(&mut State) -> Result<hyper::http::Response<hyper::Body>, crate::error::NotedError>,
{
    let res = match f(&mut state) {
        Ok(res) => res,
        Err(e) => e.into_json_response(&state),
    };

    future::ok((state, res)).boxed()
}

trait StateExt {
    fn current_user(&self) -> Result<noted_db::models::User, crate::error::NotedError>;
    fn db(
        &self,
    ) -> Result<PooledConnection<ConnectionManager<PgConnection>>, noted_db::error::DbError>;
}

impl StateExt for State {
    fn current_user(&self) -> Result<noted_db::models::User, crate::error::NotedError> {
        use noted_db::schema::users;

        let current_user_id = SessionData::<crate::AppData>::borrow_from(self)
            .user
            .as_ref()
            .ok_or(crate::error::NotedError::NotLoggedIn)?
            .current_user_id;

        users::table
            .find(current_user_id)
            .get_result(&self.db()?)
            .map_err(|_| crate::error::NotedError::NotLoggedIn)
    }

    fn db(
        &self,
    ) -> Result<PooledConnection<ConnectionManager<PgConnection>>, noted_db::error::DbError> {
        self.borrow::<DbConnection>().db()
    }
}

#[derive(Deserialize, StateData, StaticResponseExtender)]
struct IdParams {
    id: i32,
}

fn list_notes(state: State) -> Pin<Box<HandlerFuture>> {
    handler(state, |state| {
        json_response(state.current_user()?.list_notes(&state.db()?)?)
    })
}

fn new_note(state: State) -> Pin<Box<HandlerFuture>> {
    body_handler(state, move |s, state| {
        json_response(
            state
                .current_user()?
                .new_note(&parse_json(&s)?, &state.db()?)?,
        )
    })
}

fn read_note(state: State) -> Pin<Box<HandlerFuture>> {
    handler(state, |state| {
        let note_id = IdParams::borrow_from(state).id;
        json_response(state.current_user()?.note(note_id, &state.db()?)?)
    })
}

fn update_note(state: State) -> Pin<Box<HandlerFuture>> {
    body_handler(state, move |s, state| {
        let note_id = IdParams::borrow_from(state).id;
        json_response(
            state
                .current_user()?
                .update_note(note_id, &parse_json(&s)?, &state.db()?)?,
        )
    })
}

fn delete_note(state: State) -> Pin<Box<HandlerFuture>> {
    handler(state, |state| {
        let note_id = IdParams::borrow_from(state).id;
        if state.current_user()?.delete_note(note_id, &state.db()?) {
            json_response(json!({
                "status": "ok"
            }))
        } else {
            Err(crate::error::NotedError::NotFound(
                failure::format_err!("no record deleted").compat(),
            ))
        }
    })
}

fn set_tags(state: State) -> Pin<Box<HandlerFuture>> {
    body_handler(state, move |s, state| {
        let note_id = IdParams::borrow_from(state).id;
        json_response(state.current_user()?.set_note_tags(
            note_id,
            &parse_json::<Vec<_>>(&s)?,
            &state.db()?,
        )?)
    })
}

fn log_in(state: &mut State, u: &noted_db::models::User) {
    let data = SessionData::<crate::AppData>::borrow_mut_from(state);
    data.user = Some(UserData {
        current_user_id: u.id,
    });
}

fn sign_up(state: State) -> Pin<Box<HandlerFuture>> {
    use noted_db::models::User;

    body_handler(state, move |s, mut state| {
        let user = User::sign_up(parse_json(&s)?, &state.db()?)?;
        log_in(&mut state, &user);

        json_response(user)
    })
}

fn sign_in(state: State) -> Pin<Box<HandlerFuture>> {
    use noted_db::models::User;

    body_handler(state, move |s, mut state| {
        match User::sign_in(&parse_json(&s)?, &state.db()?) {
            Ok(user) => {
                log_in(&mut state, &user);
                json_response(user)
            }
            Err(noted_db::error::DbError::NotLoggedIn) => {
                let data = SessionData::<crate::AppData>::borrow_mut_from(state);
                data.user = None;

                Err(crate::error::NotedError::NotLoggedIn)
            }
            Err(e) => Err(e.into()),
        }
    })
}

fn get_user(state: State) -> Pin<Box<HandlerFuture>> {
    handler(state, |state| json_response(state.current_user()?))
}

fn sign_out(state: State) -> Pin<Box<HandlerFuture>> {
    handler(state, |state| {
        let data = SessionData::<crate::AppData>::borrow_mut_from(state);
        data.user = None;

        json_response("ok")
    })
}
