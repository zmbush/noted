// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

use {
    diesel::prelude::*,
    iron::{headers, itry, prelude::*, status, AfterMiddleware, Chain, Error, Handler},
    noted_db::models::WithTags,
    router::{router, TrailingSlash},
    serde_json::json,
};

struct JsonifyErrors;

impl AfterMiddleware for JsonifyErrors {
    fn catch(&self, _: &mut Request, mut err: IronError) -> IronResult<Response> {
        if err.error.is::<TrailingSlash>() {
            let loc = iron::Url::parse(
                err.response
                    .headers
                    .get::<headers::Location>()
                    .map(|l| l.as_str())
                    .unwrap_or(""),
            )
            .unwrap();

            err.response.headers.set(headers::Location(format!(
                "{}://{}:{}/api/{}",
                loc.scheme(),
                loc.host(),
                loc.port(),
                loc.path().join("/")
            )));

            return Ok(err.response);
        }

        let status = err
            .response
            .status
            .unwrap_or_else(|| status::InternalServerError);
        let response = json!({
            "error": err.description(),
            "reason": status.canonical_reason().unwrap_or("unknown"),
            "code": status.to_u16(),
        });

        Ok(Response::with((
            status,
            serde_json::to_string(&response).unwrap(),
        )))
    }
}

pub fn api() -> impl Handler {
    let api_router = router! {
        titles_list: get "titles" => list_titles,
        notes_list: get "notes" => list_notes,
        notes_create: put "note" => new_note,
        notes_read: get "notes/:id" => read_note,
        notes_update: patch "notes/:id" => update_note,
        notes_delete: delete "notes/:id" => delete_note,
    };

    let mut api_chain = Chain::new(api_router);
    api_chain.link_after(JsonifyErrors);

    api_chain
}

fn render_json<S: serde::Serialize>(s: S) -> IronResult<Response> {
    Ok(Response::with((
        status::Ok,
        itry!(serde_json::to_string(&s)),
    )))
}

fn read_body<D: serde::de::DeserializeOwned>(req: &mut Request) -> IronResult<D> {
    Ok(itry!(serde_json::from_reader(&mut req.body)))
}

fn get_id(req: &mut Request) -> IronResult<i32> {
    Ok(itry!(req
        .extensions
        .get::<router::Router>()
        .unwrap()
        .find("id")
        .unwrap()
        .parse()))
}

fn list_titles(_: &mut Request) -> IronResult<Response> {
    use noted_db::schema::notes::dsl::*;

    render_json::<Vec<(i32, String)>>(itry!(notes.select((id, title)).load(&noted_db::db()?)))
}

fn list_notes(_: &mut Request) -> IronResult<Response> {
    use {
        diesel::pg::expression::dsl::any,
        noted_db::{
            db,
            models::{Note, NoteToTag, NoteWithTags},
            schema::{note_tags_id, notes, tags},
        },
    };

    let conn = db()?;

    let all_notes = itry!(notes::table.load::<Note>(&conn));
    let tags_query = note_tags_id::table
        .filter(note_tags_id::note_id.eq(any(all_notes.iter().map(|n| n.id).collect::<Vec<_>>())))
        .inner_join(tags::table)
        .select((
            note_tags_id::id,
            note_tags_id::note_id,
            note_tags_id::tag_id,
            tags::tag,
        ));

    let note_tags = itry!(tags_query.load::<NoteToTag>(&conn)).grouped_by(&all_notes);

    render_json(
        all_notes
            .into_iter()
            .zip(note_tags)
            .map(|(n, ts)| NoteWithTags {
                id: n.id,
                title: n.title,
                body: n.body,
                tags: ts.into_iter().map(|i| i.tag).collect(),
            })
            .collect::<Vec<_>>(),
    )
}

fn new_note(req: &mut Request) -> IronResult<Response> {
    use noted_db::schema::notes;

    let new_note: noted_db::models::NewNote = read_body(req)?;

    render_json(
        itry!(diesel::insert_into(notes::table)
            .values(&new_note)
            .get_result::<noted_db::models::Note>(&noted_db::db()?))
        .with_tags(&noted_db::db()?),
    )
}

fn read_note(req: &mut Request) -> IronResult<Response> {
    use noted_db::schema::notes::dsl::*;

    render_json(
        itry!(notes
            .find(get_id(req)?)
            .first::<noted_db::models::Note>(&noted_db::db()?))
        .with_tags(&noted_db::db()?),
    )
}

fn update_note(req: &mut Request) -> IronResult<Response> {
    use noted_db::schema::notes::dsl::*;

    let update_note: noted_db::models::UpdateNote = read_body(req)?;

    render_json(
        itry!(diesel::update(notes.find(get_id(req)?))
            .set(&update_note)
            .get_result::<noted_db::models::Note>(&noted_db::db()?))
        .with_tags(&noted_db::db()?),
    )
}

fn delete_note(req: &mut Request) -> IronResult<Response> {
    use noted_db::schema::notes::dsl::*;

    if itry!(diesel::delete(notes.find(get_id(req)?)).execute(&noted_db::db()?)) != 0 {
        Ok(Response::with((status::Ok, "{\"status\":\"ok\"}")))
    } else {
        Ok(Response::with((
            status::NotFound,
            "{\"status\":\"no record deleted\"}",
        )))
    }
}
