// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

use {
    crate::schema::{note_tags_id, notes, tags, users},
    diesel::{
        pg::PgConnection,
        prelude::*,
        r2d2::{ConnectionManager, PooledConnection},
    },
    serde_derive::{Deserialize, Serialize},
};

#[derive(Identifiable, Queryable, Serialize, Associations)]
#[belongs_to(User)]
pub struct Note {
    pub id: i32,
    pub title: String,
    pub body: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub user_id: i32,
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
            user_id: self.user_id,
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
    pub user_id: i32,
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

#[derive(Debug, Deserialize, Serialize)]
pub struct NewUserRequest {
    pub email: String,
    pub name: String,
    #[serde(skip_serializing)]
    pub password: String,
}

impl NewUserRequest {
    pub fn new_user(self) -> std::io::Result<NewUser> {
        Ok(NewUser {
            name: self.name,
            email: self.email,
            hashed_password: crypto::pbkdf2::pbkdf2_simple(&self.password, 10_000)?,
        })
    }
}

#[derive(Insertable)]
#[table_name = "users"]
pub struct NewUser {
    pub name: String,
    pub email: String,
    pub hashed_password: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct SignIn {
    pub email: String,
    pub password: String,
}

impl SignIn {
    pub fn matches(&self, u: &User) -> bool {
        crypto::pbkdf2::pbkdf2_check(&self.password, &u.hashed_password).unwrap_or(false)
    }
}

#[derive(Identifiable, Queryable, Serialize, Associations)]
pub struct User {
    pub id: i32,
    pub name: String,
    pub email: String,
    #[serde(skip_serializing)]
    pub hashed_password: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::db;
    use diesel::Connection;
    use diesel::RunQueryDsl;

    #[test]
    fn test_with_tags() {
        use crate::schema::{notes::dsl::*, users::dsl::*};
        let db = db().unwrap();
        db.test_transaction::<_, diesel::result::Error, _>(|| {
            let new_user = NewUserRequest {
                email: "b@c.d".to_owned(),
                name: "person".to_owned(),
                password: "password".to_owned(),
            };
            let user = diesel::insert_into(users)
                .values(new_user.new_user().unwrap())
                .get_result::<User>(&db)
                .unwrap();

            diesel::insert_into(notes)
                .values((
                    NewNote {
                        title: "Title".to_string(),
                        body: "bitle".to_string(),
                    },
                    user_id.eq(user.id),
                ))
                .get_result::<Note>(&db)
                .unwrap();
            let note = notes.first::<Note>(&db)?;
            let note_with_tags = note.with_tags(&db).unwrap();
            serde_json::to_string(&note_with_tags).unwrap();
            Ok(())
        });
    }

    #[test]
    fn test_user() {
        use crate::schema::users::dsl::*;
        let db = db().unwrap();
        db.test_transaction::<_, diesel::result::Error, _>(|| {
            let new_user = NewUserRequest {
                email: "a@b.c".to_owned(),
                name: "person".to_owned(),
                password: "password".to_owned(),
            };
            let user = diesel::insert_into(users)
                .values(new_user.new_user().unwrap())
                .get_result::<User>(&db)
                .unwrap();

            let sign_in = SignIn {
                email: "a@b.c".to_owned(),
                password: "password".to_owned(),
            };

            assert!(sign_in.matches(&user));

            Ok(())
        });
    }
}
