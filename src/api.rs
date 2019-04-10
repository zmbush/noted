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
        middleware::Middleware,
        pipeline::{new_pipeline, single::single_pipeline},
        router::{builder::*, response::extender::ResponseExtender, Router},
        state::{FromState, State},
    },
    gotham_derive::{NewMiddleware, StateData, StaticResponseExtender},
    http::response::Response,
    noted_db::models::WithTags,
    serde_derive::Deserialize,
    serde_json::json,
};

#[derive(Clone, NewMiddleware)]
struct JsonifyErrors;

impl Middleware for JsonifyErrors {
    fn call<Chain>(self, state: State, chain: Chain) -> Box<HandlerFuture>
    where
        Chain: FnOnce(State) -> Box<HandlerFuture> + Send + 'static,
    {
        let result = chain(state);

        let f = result.or_else(move |(state, error)| {
            let response_body = json!({
                "error": format!("{}", error),
                "details": format!("{:?}", error),
            });

            let mut response = error.into_response(&state);

            *response.body_mut() =
                hyper::Body::from(serde_json::to_string(&response_body).unwrap());

            future::ok((state, response))
        });

        Box::new(f)
    }
}

struct NotFoundHandler;

impl ResponseExtender<hyper::Body> for NotFoundHandler {
    fn extend(&self, _state: &mut State, response: &mut Response<hyper::Body>) {
        let response_body = json!({
            "error": "api route not found",
            "code": response.status().as_u16()
        });

        response.headers_mut().insert(
            hyper::header::CONTENT_TYPE,
            hyper::header::HeaderValue::from_static("application/json"),
        );
        *response.body_mut() = hyper::Body::from(serde_json::to_string(&response_body).unwrap());
    }
}

pub fn api() -> Router {
    let (chain, pipelines) = single_pipeline(new_pipeline().add(JsonifyErrors).build());
    build_router(chain, pipelines, |route| {
        route.add_response_extender(http::status::StatusCode::NOT_FOUND, NotFoundHandler);
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
        + Fn(String, &State) -> Result<hyper::http::Response<hyper::Body>, crate::error::NotedError>,
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
        + Fn(&State) -> Result<hyper::http::Response<hyper::Body>, crate::error::NotedError>,
{
    Box::new(match f(&mut state) {
        Ok(res) => future::ok((state, res)),
        Err(e) => future::err((state, e.into_handler_error())),
    })
}

#[derive(Deserialize, StateData, StaticResponseExtender)]
struct IdParams {
    id: i32,
}

fn list_titles(state: State) -> Box<HandlerFuture> {
    use noted_db::schema::notes::dsl::*;

    handler(state, |_| {
        json_response::<Vec<(i32, String)>>(notes.select((id, title)).load(&noted_db::db()?)?)
    })
}

fn list_notes(state: State) -> Box<HandlerFuture> {
    use noted_db::{
        db,
        models::{Note, NoteToTag, NoteWithTags},
        schema::{note_tags_id, notes, tags},
    };

    handler(state, |_| {
        let conn = db()?;

        let all_notes = notes::table.load::<Note>(&conn)?;

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
                })
                .collect::<Vec<_>>(),
        )
    })
}

fn new_note(state: State) -> Box<HandlerFuture> {
    use noted_db::schema::notes;

    body_handler(state, move |s, _state| {
        let new_note: noted_db::models::NewNote = parse_json(&s)?;

        json_response(
            diesel::insert_into(notes::table)
                .values(&new_note)
                .get_result::<noted_db::models::Note>(&noted_db::db()?)?
                .with_tags(&noted_db::db()?),
        )
    })
}

fn note_for_id(
    note_id: i32,
) -> Result<hyper::http::Response<hyper::Body>, crate::error::NotedError> {
    use noted_db::schema::notes::dsl::*;

    json_response(
        notes
            .find(note_id)
            .first::<noted_db::models::Note>(&noted_db::db()?)?
            .with_tags(&noted_db::db()?),
    )
}

fn read_note(state: State) -> Box<HandlerFuture> {
    handler(state, |state| {
        let note_id = IdParams::borrow_from(&state).id;

        note_for_id(note_id)
    })
}

fn update_note(state: State) -> Box<HandlerFuture> {
    use noted_db::schema::notes::dsl::*;

    body_handler(state, move |s, state| {
        let IdParams { id: note_id } = IdParams::borrow_from(&state);

        let update_note: noted_db::models::UpdateNote = serde_json::from_str(&s)?;

        json_response(
            diesel::update(notes.find(note_id))
                .set(&update_note)
                .get_result::<noted_db::models::Note>(&noted_db::db()?)?
                .with_tags(&noted_db::db()?),
        )
    })
}

fn delete_note(state: State) -> Box<HandlerFuture> {
    use noted_db::schema::notes::dsl::*;

    handler(state, |state| {
        let IdParams { id: note_id } = IdParams::borrow_from(&state);

        if diesel::delete(notes.find(note_id)).execute(&noted_db::db()?)? != 0 {
            json_response(json!({
                "status": "ok"
            }))
        } else {
            Err(crate::error::NotedError::NotFound("no record deleted"))
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

        note_for_id(*current_note_id)
    })
}
