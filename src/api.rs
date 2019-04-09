// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

use {
    diesel::prelude::*,
    futures::{future, stream::Stream, Future},
    gotham::{
        handler::{HandlerFuture, IntoHandlerError, IntoResponse},
        middleware::{session::SessionData, Middleware},
        pipeline::{new_pipeline, single::single_pipeline},
        router::{builder::*, response::extender::ResponseExtender, Router},
        state::{FromState, State},
    },
    gotham_derive::{NewMiddleware, StateData, StaticResponseExtender},
    http::{response::Response, status::StatusCode},
    log::info,
    noted_db::models::WithTags,
    serde_derive::{Deserialize, Serialize},
    serde_json::json,
};

#[derive(Serialize, Deserialize, Default)]
pub struct UserData {
    current_user_id: i32,
}

#[derive(Clone, NewMiddleware)]
struct JsonifyErrors;

impl Middleware for JsonifyErrors {
    fn call<Chain>(self, state: State, chain: Chain) -> Box<HandlerFuture>
    where
        Chain: FnOnce(State) -> Box<HandlerFuture> + Send + 'static,
    {
        let result = chain(state);

        info!("Checking for errors");

        let f = result.then(|result| match result {
            Ok((state, response)) => {
                info!("It's a thing? {:?}", response);
                future::ok((state, response))
            }
            Err((state, error)) => {
                info!("Creating better response");
                let response_body = json!({
                    "error": format!("{}", error),
                    "details": format!("{:?}", error),
                });

                let mut response = error.into_response(&state);

                *response.body_mut() =
                    hyper::Body::from(serde_json::to_string(&response_body).unwrap());

                future::ok((state, response))
            }
        });

        Box::new(f)
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
    fn call<Chain>(self, state: State, chain: Chain) -> Box<HandlerFuture>
    where
        Chain: FnOnce(State) -> Box<HandlerFuture> + Send + 'static,
    {
        info!("Checking for user");
        if SessionData::<crate::AppData>::borrow_from(&state)
            .user
            .is_some()
        {
            chain(state)
        } else {
            info!("No user available");
            Box::new(future::err((
                state,
                crate::error::NotedError::NotLoggedIn.into_handler_error(),
            )))
        }
    }
}

fn secure_api() -> Router {
    let (chain, pipelines) =
        single_pipeline(new_pipeline().add(RequireUser).add(JsonifyErrors).build());

    build_router(chain, pipelines, |route| {
        route.add_response_extender(StatusCode::NOT_FOUND, StaticErrorHandler("not found"));

        route.get("titles").to(list_titles);
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

fn parse_json<'a, D: serde::Deserialize<'a>>(s: &'a str) -> Result<D, crate::error::NotedError> {
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

fn body_handler<F>(mut state: State, f: F) -> Box<HandlerFuture>
where
    F: 'static
        + Send
        + Fn(
            String,
            &mut State,
        ) -> Result<hyper::http::Response<hyper::Body>, crate::error::NotedError>,
{
    Box::new(
        hyper::Body::take_from(&mut state)
            .concat2()
            .then(move |full_body| match full_body {
                Ok(valid_body) => {
                    let body_content = String::from_utf8(valid_body.to_vec()).unwrap();
                    match f(body_content, &mut state) {
                        Ok(res) => future::ok((state, res)),
                        Err(e) => future::err((state, e.into_handler_error())),
                    }
                }
                Err(e) => future::err((
                    state,
                    crate::error::NotedError::from(e).into_handler_error(),
                )),
            }),
    )
}

fn handler<F>(mut state: State, f: F) -> Box<HandlerFuture>
where
    F: 'static
        + Send
        + Fn(&mut State) -> Result<hyper::http::Response<hyper::Body>, crate::error::NotedError>,
{
    Box::new(match f(&mut state) {
        Ok(res) => future::ok((state, res)),
        Err(e) => future::err((state, e.into_handler_error())),
    })
}

trait StateExt {
    fn current_user(&self) -> Result<noted_db::models::User, crate::error::NotedError>;
}

impl StateExt for State {
    fn current_user(&self) -> Result<noted_db::models::User, crate::error::NotedError> {
        use noted_db::schema::users;

        let current_user_id = SessionData::<crate::AppData>::borrow_from(self)
            .user
            .as_ref()
            .ok_or_else(|| crate::error::NotedError::NotLoggedIn)?
            .current_user_id;

        Ok(users::table
            .find(current_user_id)
            .get_result(&noted_db::db()?)?)
    }
}

#[derive(Deserialize, StateData, StaticResponseExtender)]
struct IdParams {
    id: i32,
}

fn list_titles(state: State) -> Box<HandlerFuture> {
    use noted_db::schema::notes::dsl::*;

    handler(state, |state| {
        json_response::<Vec<(i32, String)>>(
            noted_db::models::Note::belonging_to(&state.current_user()?)
                .select((id, title))
                .load(&noted_db::db()?)?,
        )
    })
}

fn list_notes(state: State) -> Box<HandlerFuture> {
    use noted_db::{
        db,
        models::{Note, NoteToTag, NoteWithTags},
        schema::{note_tags_id, notes, tags},
    };

    handler(state, |state| {
        let conn = db()?;

        let all_notes = notes::table
            .filter(notes::user_id.eq_any(&[state.current_user()?.id, 1]))
            .load::<Note>(&conn)?;

        let tags_query = note_tags_id::table
            .filter(
                note_tags_id::note_id.eq_any(all_notes.iter().map(|n| n.id).collect::<Vec<_>>()),
            )
            .inner_join(tags::table)
            .select((
                note_tags_id::id,
                note_tags_id::note_id,
                note_tags_id::tag_id,
                tags::tag,
            ));

        let note_tags = tags_query.load::<NoteToTag>(&conn)?.grouped_by(&all_notes);

        json_response(
            all_notes
                .into_iter()
                .zip(note_tags)
                .map(|(n, ts)| NoteWithTags {
                    id: n.id,
                    title: n.title,
                    body: n.body,
                    tags: ts.into_iter().map(|i| i.tag).collect(),
                    created_at: n.created_at,
                    updated_at: n.updated_at,
                    user_id: n.user_id,
                })
                .collect::<Vec<_>>(),
        )
    })
}

fn new_note(state: State) -> Box<HandlerFuture> {
    use noted_db::schema::notes;

    body_handler(state, move |s, state| {
        let new_note: noted_db::models::NewNote = parse_json(&s)?;

        json_response(
            diesel::insert_into(notes::table)
                .values((&new_note, notes::user_id.eq(state.current_user()?.id)))
                .get_result::<noted_db::models::Note>(&noted_db::db()?)?
                .with_tags(&noted_db::db()?),
        )
    })
}

fn note_for_id(
    user: &noted_db::models::User,
    note_id: i32,
) -> Result<hyper::http::Response<hyper::Body>, crate::error::NotedError> {
    json_response(
        noted_db::models::Note::belonging_to(user)
            .find(note_id)
            .first::<noted_db::models::Note>(&noted_db::db()?)?
            .with_tags(&noted_db::db()?),
    )
}

fn read_note(state: State) -> Box<HandlerFuture> {
    handler(state, |state| {
        let note_id = IdParams::borrow_from(&state).id;

        note_for_id(&state.current_user()?, note_id)
    })
}

fn update_note(state: State) -> Box<HandlerFuture> {
    use noted_db::schema::notes::dsl::*;

    body_handler(state, move |s, state| {
        let IdParams { id: note_id } = IdParams::borrow_from(&state);
        let current_user = state.current_user()?;

        let update_note: noted_db::models::UpdateNote = serde_json::from_str(&s)?;

        diesel::update(notes.filter(id.eq(note_id)).filter(user_id.eq(1)))
            .set(user_id.eq(current_user.id))
            .execute(&noted_db::db()?)?;

        json_response(
            diesel::update(noted_db::models::Note::belonging_to(&current_user).find(note_id))
                .set(&update_note)
                .get_result::<noted_db::models::Note>(&noted_db::db()?)?
                .with_tags(&noted_db::db()?),
        )
    })
}

fn delete_note(state: State) -> Box<HandlerFuture> {
    handler(state, |state| {
        let IdParams { id: note_id } = IdParams::borrow_from(&state);

        if diesel::delete(
            noted_db::models::Note::belonging_to(&state.current_user()?).find(note_id),
        )
        .execute(&noted_db::db()?)?
            != 0
        {
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

fn set_tags(state: State) -> Box<HandlerFuture> {
    use noted_db::schema::note_tags_id::dsl::*;
    use noted_db::schema::tags::dsl::*;

    body_handler(state, move |s, state| {
        let IdParams {
            id: current_note_id,
        } = IdParams::borrow_from(&state);

        let set_tags: Vec<String> = serde_json::from_str(&s)?;

        let conn = noted_db::db()?;

        conn.transaction::<(), diesel::result::Error, _>(|| {
            diesel::insert_into(tags)
                .values(&set_tags.iter().map(|t| tag.eq(t)).collect::<Vec<_>>())
                .on_conflict_do_nothing()
                .execute(&conn)?;

            let all_tags = tags
                .filter(tag.eq_any(set_tags))
                .load::<noted_db::models::Tag>(&conn)?;

            diesel::delete(note_tags_id.filter(note_id.eq(current_note_id))).execute(&conn)?;

            diesel::insert_into(note_tags_id)
                .values(
                    all_tags
                        .into_iter()
                        .map(|t| (tag_id.eq(t.id), note_id.eq(current_note_id)))
                        .collect::<Vec<_>>(),
                )
                .execute(&conn)?;

            let tag_ids = note_tags_id.select(tag_id).get_results::<i32>(&conn)?;

            diesel::delete(tags.filter(noted_db::schema::tags::dsl::id.ne_all(tag_ids)))
                .execute(&conn)?;

            Ok(())
        })?;

        note_for_id(&state.current_user()?, *current_note_id)
    })
}

fn log_in(state: &mut State, u: &noted_db::models::User) {
    let data = SessionData::<crate::AppData>::borrow_mut_from(state);
    data.user = Some(UserData {
        current_user_id: u.id,
    });
}

fn sign_up(state: State) -> Box<HandlerFuture> {
    use noted_db::schema::users;

    body_handler(state, move |s, mut state| {
        let user: noted_db::models::NewUserRequest = serde_json::from_str(&s)?;

        let user = diesel::insert_into(users::table)
            .values(user.new_user()?)
            .get_result::<noted_db::models::User>(&noted_db::db()?)?;
        log_in(&mut state, &user);

        json_response(user)
    })
}

fn sign_in(state: State) -> Box<HandlerFuture> {
    use noted_db::schema::users;

    body_handler(state, move |s, mut state| {
        let sign_in: noted_db::models::SignIn = serde_json::from_str(&s)?;

        let user = users::table
            .filter(users::email.eq(&sign_in.email))
            .get_result::<noted_db::models::User>(&noted_db::db()?)?;

        if sign_in.matches(&user) {
            log_in(&mut state, &user);
            json_response(user)
        } else {
            let data = SessionData::<crate::AppData>::borrow_mut_from(state);
            data.user = None;

            Err(crate::error::NotedError::NotLoggedIn)
        }
    })
}

fn get_user(state: State) -> Box<HandlerFuture> {
    handler(state, |state| json_response(state.current_user()?))
}

fn sign_out(state: State) -> Box<HandlerFuture> {
    handler(state, |state| {
        let data = SessionData::<crate::AppData>::borrow_mut_from(state);
        data.user = None;

        json_response("ok")
    })
}
