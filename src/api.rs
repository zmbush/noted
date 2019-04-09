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
        handler::{HandlerError, HandlerFuture, IntoHandlerError},
        middleware::Middleware,
        pipeline::{new_pipeline, single::single_pipeline},
        router::{builder::*, Router},
        state::{FromState, State},
    },
    gotham_derive::{NewMiddleware, StateData, StaticResponseExtender},
    http::response::Response,
    noted_db::models::WithTags,
    serde_derive::Deserialize,
    serde_json::json,
};

macro_rules! gtry {
    ($state:ident, $result:expr) => {
        match $result {
            Ok(v) => v,
            Err(e) => return Box::new(future::err(($state, e.into_handler_error()))),
        }
    };
}

macro_rules! gt {
    ($result:expr) => {
        match $result {
            Ok(v) => v,
            Err(e) => return Err(e.into_handler_error()),
        }
    };
}

#[derive(Clone, NewMiddleware)]
struct JsonifyErrors;

impl Middleware for JsonifyErrors {
    fn call<Chain>(self, state: State, chain: Chain) -> Box<HandlerFuture>
    where
        Chain: FnOnce(State) -> Box<HandlerFuture> + Send + 'static,
    {
        let result = chain(state);

        let f = result.or_else(move |(state, error)| {
            let response = json!({
                "error": format!("{}", error),
            });

            future::ok((
                state,
                Response::builder()
                    .header("Content-Type", "application/json")
                    .body(hyper::Body::from(serde_json::to_string(&response).unwrap()))
                    .unwrap(),
            ))
        });

        Box::new(f)
    }
}

pub fn api() -> Router {
    let (chain, pipelines) = single_pipeline(new_pipeline().add(JsonifyErrors).build());
    build_router(chain, pipelines, |route| {
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

fn json_response<S: serde::Serialize>(
    s: S,
) -> Result<hyper::http::Response<hyper::Body>, HandlerError> {
    Ok(Response::builder()
        .header("Content-Type", "application/json")
        .body(hyper::Body::from(
            serde_json::to_string(&s).map_err(|e| e.into_handler_error())?,
        ))
        .unwrap())
}

fn render_json<S: serde::Serialize>(
    state: State,
    s: S,
) -> impl Future<Item = (State, hyper::http::Response<hyper::Body>), Error = (State, HandlerError)>
{
    let r = gtry!(state, json_response(s));

    Box::new(future::ok((state, r)))
}

fn body_handler<F>(mut state: State, f: F) -> Box<HandlerFuture>
where
    F: 'static
        + Send
        + Fn(String, &State) -> Result<hyper::http::Response<hyper::Body>, HandlerError>,
{
    let body =
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
                Err(e) => future::err((state, e.into_handler_error())),
            });

    Box::new(body)
}

#[derive(Deserialize, StateData, StaticResponseExtender)]
struct IdParams {
    id: i32,
}

fn list_titles(state: State) -> Box<HandlerFuture> {
    use noted_db::schema::notes::dsl::*;

    let r = gtry!(
        state,
        notes
            .select((id, title))
            .load(&gtry!(state, noted_db::db()))
    );

    Box::new(render_json::<Vec<(i32, String)>>(state, r))
}

fn list_notes(state: State) -> Box<HandlerFuture> {
    use noted_db::{
        db,
        models::{Note, NoteToTag, NoteWithTags},
        schema::{note_tags_id, notes, tags},
    };

    let conn = gtry!(state, db());

    let all_notes = gtry!(state, notes::table.load::<Note>(&conn));
    let tags_query = note_tags_id::table
        .filter(note_tags_id::note_id.eq_any(all_notes.iter().map(|n| n.id).collect::<Vec<_>>()))
        .inner_join(tags::table)
        .select((
            note_tags_id::id,
            note_tags_id::note_id,
            note_tags_id::tag_id,
            tags::tag,
        ));

    let note_tags = gtry!(state, tags_query.load::<NoteToTag>(&conn)).grouped_by(&all_notes);

    Box::new(render_json(
        state,
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
    ))
}

fn new_note(state: State) -> Box<HandlerFuture> {
    use noted_db::schema::notes;

    body_handler(state, move |s, _state| {
        let new_note: noted_db::models::NewNote = gt!(serde_json::from_str(&s));

        Ok(gt!(json_response(
            gt!(diesel::insert_into(notes::table)
                .values(&new_note)
                .get_result::<noted_db::models::Note>(&gt!(noted_db::db())))
            .with_tags(&gt!(noted_db::db())),
        )))
    })
}

fn note_for_id(note_id: i32) -> Result<hyper::http::Response<hyper::Body>, HandlerError> {
    use noted_db::schema::notes::dsl::*;

    Ok(gt!(json_response(
        gt!(notes
            .find(note_id)
            .first::<noted_db::models::Note>(&gt!(noted_db::db())))
        .with_tags(&gt!(noted_db::db())),
    )))
}

fn read_note(state: State) -> Box<HandlerFuture> {
    let note_id = IdParams::borrow_from(&state).id;

    let r = gtry!(state, note_for_id(note_id));

    Box::new(future::ok((state, r)))
}

fn update_note(state: State) -> Box<HandlerFuture> {
    use noted_db::schema::notes::dsl::*;

    body_handler(state, move |s, state| {
        let IdParams { id: note_id } = IdParams::borrow_from(&state);

        let update_note: noted_db::models::UpdateNote = gt!(serde_json::from_str(&s));
        Ok(gt!(json_response(
            gt!(diesel::update(notes.find(note_id))
                .set(&update_note)
                .get_result::<noted_db::models::Note>(&gt!(noted_db::db())))
            .with_tags(&gt!(noted_db::db())),
        )))
    })
}

fn delete_note(state: State) -> Box<HandlerFuture> {
    use noted_db::schema::notes::dsl::*;

    let IdParams { id: note_id } = IdParams::borrow_from(&state);

    Box::new(
        if gtry!(
            state,
            diesel::delete(notes.find(note_id)).execute(&gtry!(state, noted_db::db()))
        ) != 0
        {
            future::ok((
                state,
                Response::builder()
                    .header("Content-Type", "application/json")
                    .body(hyper::Body::from("{\"status\":\"ok\"}"))
                    .unwrap(),
            ))
        } else {
            future::ok((
                state,
                Response::builder()
                    .header("Content-Type", "application/json")
                    .status(404)
                    .body(hyper::Body::from("{\"status\":\"no record deleted\"}"))
                    .unwrap(),
            ))
        },
    )
}

fn set_tags(state: State) -> Box<HandlerFuture> {
    use noted_db::schema::note_tags_id::dsl::*;
    use noted_db::schema::tags::dsl::*;

    body_handler(state, move |s, state| {
        let IdParams {
            id: current_note_id,
        } = IdParams::borrow_from(&state);

        let set_tags: Vec<String> = gt!(serde_json::from_str(&s));

        let conn = gt!(noted_db::db());

        gt!(conn.transaction::<(), diesel::result::Error, _>(|| {
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
        }));

        note_for_id(*current_note_id)
    })
}
