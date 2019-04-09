// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

use {
    crate::schema::{note_tags_id, notes, tags},
    diesel::{
        pg::PgConnection,
        prelude::*,
        r2d2::{ConnectionManager, PooledConnection},
    },
    serde_derive::{Deserialize, Serialize},
};

#[derive(Identifiable, Queryable, Serialize, Associations)]
pub struct Note {
    pub id: i32,
    pub title: String,
    pub body: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

pub trait WithTags {
    type Output;
    fn with_tags(
        self,
        c: &PooledConnection<ConnectionManager<PgConnection>>,
    ) -> Option<Self::Output>;
}

impl WithTags for Note {
    type Output = NoteWithTags;

    fn with_tags(
        self,
        c: &PooledConnection<ConnectionManager<PgConnection>>,
    ) -> Option<NoteWithTags> {
        Some(NoteWithTags {
            id: self.id,
            title: self.title,
            body: self.body,
            tags: note_tags_id::table
                .filter(note_tags_id::note_id.eq(self.id))
                .inner_join(tags::table)
                .select(tags::tag)
                .load::<String>(c)
                .ok()?,
            created_at: self.created_at,
            updated_at: self.updated_at,
        })
    }
}

#[derive(Serialize)]
pub struct NoteWithTags {
    pub id: i32,
    pub title: String,
    pub body: String,
    pub tags: Vec<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Identifiable, Queryable, Serialize, Associations)]
#[belongs_to(Note)]
#[table_name = "note_tags_id"]
pub struct NoteToTag {
    pub id: i32,
    pub note_id: i32,
    pub tag_id: i32,
    pub tag: String,
}

#[derive(Identifiable, Queryable, Serialize, Associations)]
pub struct Tag {
    pub id: i32,
    pub tag: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Identifiable, Queryable, Associations)]
#[belongs_to(Note)]
#[belongs_to(Tag)]
#[table_name = "note_tags_id"]
pub struct NoteTag {
    pub id: i32,
    pub note_id: i32,
    pub tag_id: i32,
}

#[derive(Insertable, Deserialize)]
#[table_name = "notes"]
pub struct NewNote {
    pub title: String,
    pub body: String,
}

#[derive(AsChangeset, Deserialize)]
#[table_name = "notes"]
pub struct UpdateNote {
    pub title: Option<String>,
    pub body: Option<String>,
}
