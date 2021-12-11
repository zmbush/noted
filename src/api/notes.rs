// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//

use actix_web::{delete, get, patch, put, web, HttpResponse};
use noted_db::{
    models::{NewNotePayload, UpdateNotePayload},
    DbConnection,
};
use serde::Deserialize;
use serde_json::json;

use crate::{api::current_user::CurrentUser, error::NotedError};

pub trait NoteScopeExt {
    fn add_note_routes(self) -> Self;
}

impl NoteScopeExt for actix_web::Scope {
    fn add_note_routes(self) -> Self {
        self.service(new_note)
            .service(list_notes)
            .service(get_note)
            .service(update_note)
            .service(delete_note)
            .service(set_tags)
    }
}

#[get("/notes")]
async fn list_notes(
    user: CurrentUser,
    db_pool: web::Data<DbConnection>,
) -> Result<HttpResponse, NotedError> {
    Ok(HttpResponse::Ok().json(user.list_notes(&db_pool.db()?)?))
}

#[put("/note")]
async fn new_note(
    user: CurrentUser,
    db_pool: web::Data<DbConnection>,
    new_note: web::Json<NewNotePayload>,
) -> Result<HttpResponse, NotedError> {
    Ok(HttpResponse::Ok().json(&user.new_note(&*new_note, &db_pool.db()?)?))
}

#[derive(Deserialize)]
struct NoteId {
    id: i32,
}

#[get("/notes/{id}")]
async fn get_note(
    user: CurrentUser,
    db_pool: web::Data<DbConnection>,
    note_id: web::Path<NoteId>,
) -> Result<HttpResponse, NotedError> {
    Ok(HttpResponse::Ok().json(user.note(note_id.id, &db_pool.db()?)?))
}

#[patch("/notes/{id}")]
async fn update_note(
    user: CurrentUser,
    db_pool: web::Data<DbConnection>,
    note_id: web::Path<NoteId>,
    update_note: web::Json<UpdateNotePayload>,
) -> Result<HttpResponse, NotedError> {
    Ok(HttpResponse::Ok().json(user.update_note(note_id.id, &*update_note, &db_pool.db()?)?))
}

#[delete("/notes/{id}")]
async fn delete_note(
    user: CurrentUser,
    db_pool: web::Data<DbConnection>,
    note_id: web::Path<NoteId>,
) -> Result<HttpResponse, NotedError> {
    user.delete_note(note_id.id, &db_pool.db()?);
    Ok(HttpResponse::Ok().json(&json!({"status": "ok"})))
}

#[put("/notes/{id}/tags")]
async fn set_tags(
    user: CurrentUser,
    db_pool: web::Data<DbConnection>,
    note_id: web::Path<NoteId>,
    tags: web::Json<Vec<String>>,
) -> Result<HttpResponse, NotedError> {
    Ok(HttpResponse::Ok().json(user.set_note_tags(note_id.id, &*tags, &db_pool.db()?)?))
}
