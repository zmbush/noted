// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

use {
    crate::{
        error::{DbError, Result},
        schema::{note_tags_id, notes, tags, users},
    },
    diesel::{
        pg::PgConnection,
        prelude::*,
        r2d2::{ConnectionManager, PooledConnection},
    },
    serde_derive::{Deserialize, Serialize},
    std::collections::HashSet,
};

#[derive(Identifiable, Queryable, Serialize, Associations, Debug)]
#[belongs_to(User)]
pub struct Note {
    pub id: i32,
    pub title: String,
    pub body: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub user_id: i32,
    pub parent_note_id: i32,
    pub archived: bool,
    pub pinned: bool,
}

type Conn = PooledConnection<ConnectionManager<PgConnection>>;
impl Note {
    fn with(self, t: Vec<NoteToTag>) -> NoteWithTags {
        NoteWithTags {
            id: self.id,
            title: self.title,
            body: self.body,
            tags: t.into_iter().map(|i| i.tag).collect(),
            created_at: self.created_at,
            updated_at: self.updated_at,
            user_id: self.user_id,
            parent_note_id: self.parent_note_id,
            archived: self.archived,
            pinned: self.pinned,
        }
    }
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
        let mut tags = note_tags_id::table
            .filter(note_tags_id::note_id.eq(self.id))
            .inner_join(tags::table)
            .select(tags::tag)
            .load::<String>(c)
            .ok()?;
        tags.sort();

        Some(NoteWithTags {
            id: self.id,
            title: self.title,
            body: self.body,
            created_at: self.created_at,
            updated_at: self.updated_at,
            user_id: self.user_id,
            parent_note_id: self.parent_note_id,
            archived: self.archived,
            pinned: self.pinned,
            tags,
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
    pub parent_note_id: i32,
    pub archived: bool,
    pub pinned: bool,
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
    pub parent_note_id: Option<i32>,
}

#[derive(AsChangeset, Deserialize)]
#[table_name = "notes"]
pub struct UpdateNote {
    pub title: Option<String>,
    pub body: Option<String>,
    pub parent_note_id: Option<i32>,
    pub archived: Option<bool>,
    pub pinned: Option<bool>,
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

#[derive(Identifiable, Queryable, Serialize, Associations, Debug)]
pub struct User {
    pub id: i32,
    pub name: String,
    pub email: String,
    #[serde(skip_serializing)]
    pub hashed_password: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

impl User {
    pub fn new_note(&self, new_note: &NewNote, db: &Conn) -> Result<NoteWithTags> {
        use crate::schema::notes::dsl::*;

        diesel::insert_into(notes)
            .values((new_note, user_id.eq(self.id)))
            .get_result::<Note>(db)?
            .with_tags(db)
            .ok_or_else(|| DbError::NotFound)
    }

    pub fn list_notes(&self, db: &Conn) -> Result<Vec<NoteWithTags>> {
        let all_notes = {
            use crate::schema::notes::dsl::*;
            notes.filter(user_id.eq(self.id)).load::<Note>(db)?
        };

        let tags_query = {
            use crate::schema::note_tags_id::dsl::*;
            note_tags_id
                .filter(note_id.eq_any(all_notes.iter().map(|n| n.id).collect::<Vec<_>>()))
                .inner_join(tags::table)
                .select((id, note_id, tag_id, tags::tag))
        };

        let note_tags = tags_query.load::<NoteToTag>(db)?.grouped_by(&all_notes);

        Ok(all_notes
            .into_iter()
            .zip(note_tags)
            .map(|(n, ts)| n.with(ts))
            .collect::<Vec<_>>())
    }

    pub fn note(&self, id: i32, db: &Conn) -> Result<NoteWithTags> {
        Ok(Note::belonging_to(self)
            .find(id)
            .first::<Note>(db)?
            .with_tags(db)
            .ok_or_else(|| DbError::NotFound)?)
    }

    pub fn update_note(&self, id: i32, note: &UpdateNote, db: &Conn) -> Result<NoteWithTags> {
        diesel::update(Note::belonging_to(self).find(id))
            .set(note)
            .execute(db)?;

        self.note(id, db)
    }

    pub fn delete_note(&self, id: i32, db: &Conn) -> bool {
        diesel::delete(Note::belonging_to(self).find(id))
            .execute(db)
            .unwrap_or(0)
            != 0
    }

    pub fn set_note_tags(
        &self,
        current_note_id: i32,
        set_tags: &[String],
        db: &Conn,
    ) -> Result<NoteWithTags> {
        db.transaction::<(), diesel::result::Error, _>(|| {
            use crate::schema::{note_tags_id::dsl::*, tags::dsl::*};

            // TODO: Server needs Postgres 9.5 to support ON CONFLICT DO NOTHING
            // BODY: In the meantime, we need to calculate exactly which tags need to be added.
            let tag_set = set_tags
                .iter()
                .map(ToOwned::to_owned)
                .collect::<HashSet<_>>();

            let known_tags = tags
                .filter(&tag.eq_any(set_tags))
                .select(tag)
                .get_results::<String>(db)?
                .into_iter()
                .collect::<HashSet<_>>();

            let new_tags = tag_set.difference(&known_tags).collect::<Vec<_>>();

            diesel::insert_into(tags)
                .values(&new_tags.iter().map(|t| tag.eq(t)).collect::<Vec<_>>())
                .execute(db)?;

            let all_tags = tags.filter(tag.eq_any(set_tags)).load::<Tag>(db)?;

            diesel::delete(note_tags_id.filter(note_id.eq(current_note_id))).execute(db)?;

            diesel::insert_into(note_tags_id)
                .values(
                    all_tags
                        .into_iter()
                        .map(|t| (tag_id.eq(t.id), note_id.eq(current_note_id)))
                        .collect::<Vec<_>>(),
                )
                .execute(db)?;

            let tag_ids = note_tags_id.select(tag_id).get_results::<i32>(db)?;

            diesel::delete(tags.filter(crate::schema::tags::dsl::id.ne_all(tag_ids)))
                .execute(db)?;

            Ok(())
        })?;

        self.note(current_note_id, db)
    }

    pub fn sign_up(new_user: NewUserRequest, db: &Conn) -> Result<User> {
        Ok(diesel::insert_into(crate::schema::users::table)
            .values(new_user.new_user()?)
            .get_result(db)?)
    }

    pub fn sign_in(sign_in: &SignIn, db: &Conn) -> Result<User> {
        use crate::schema::users::dsl::*;
        let user = users.filter(email.eq(&sign_in.email)).get_result(db)?;

        if sign_in.matches(&user) {
            Ok(user)
        } else {
            Err(DbError::NotLoggedIn)
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::db;
    use diesel::Connection;

    fn parse<'a, D: serde::Deserialize<'a>>(s: &'a str) -> D {
        serde_json::from_str(s).unwrap()
    }

    fn test_user(db: &Conn) -> User {
        User::sign_up(
            parse(
                r#"{
                    "email": "test@example.com",
                    "name": "Test User",
                    "password": "password"
                }"#,
            ),
            db,
        )
        .unwrap()
    }

    #[test]
    fn test_with_tags() {
        let db = db().unwrap();
        db.test_transaction::<_, diesel::result::Error, _>(|| {
            let user = test_user(&db);
            let note = user
                .new_note(&parse(r#"{ "title": "Title", "body": "Body" }"#), &db)
                .unwrap();
            serde_json::to_string(&note).unwrap();
            assert_eq!(note.title, "Title");
            assert_eq!(user.list_notes(&db).unwrap().len(), 1);
            let note = user
                .update_note(note.id, &parse(r#"{ "title": "New Title" }"#), &db)
                .unwrap();
            assert_eq!(note.title, "New Title");
            user.delete_note(note.id, &db);
            assert_eq!(user.list_notes(&db).unwrap().len(), 0);
            Ok(())
        });
    }

    #[test]
    fn test_modifying_tags() {
        let db = db().unwrap();
        db.test_transaction::<_, diesel::result::Error, _>(|| {
            let user = test_user(&db);
            let note = user
                .new_note(
                    &NewNote {
                        title: "Title".to_owned(),
                        body: "Body".to_owned(),
                        parent_note_id: None,
                    },
                    &db,
                )
                .unwrap();

            let note = user
                .set_note_tags(note.id, &["Tag5".to_owned(), "Tag2".to_owned()], &db)
                .unwrap();

            assert_eq!(note.tags, vec!["Tag2".to_owned(), "Tag5".to_owned()]);

            let note = user
                .set_note_tags(note.id, &["Tag1".to_owned(), "Tag3".to_owned()], &db)
                .unwrap();

            assert_eq!(note.tags, vec!["Tag1".to_owned(), "Tag3".to_owned()]);

            Ok(())
        });
    }

    #[test]
    fn test_creating_user() {
        let db = db().unwrap();
        db.test_transaction::<_, diesel::result::Error, _>(|| {
            test_user(&db);

            assert!(User::sign_in(
                &parse(r#"{ "email": "test@example.com", "password": "bad password" }"#),
                &db,
            )
            .is_err());

            assert!(User::sign_in(
                &parse(r#"{ "email": "test@example.com", "password": "password" }"#),
                &db,
            )
            .is_ok());

            Ok(())
        });
    }
}
