// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//

use crate::error::NotedError;
use actix_http::Payload;
use actix_session::Session;
use actix_web::{web, FromRequest, HttpRequest};
use diesel::{QueryDsl, RunQueryDsl};
use futures::future::{self, Ready};
use noted_db::DbConnection;
use std::ops::Deref;

const ID_KEY: &str = "user_id";
pub struct CurrentUser(noted_db::models::User);

impl CurrentUser {
    pub fn set(
        session: &Session,
        user: Option<&noted_db::models::User>,
    ) -> Result<(), actix_http::Error> {
        if let Some(user) = user {
            session.set(ID_KEY, user.id)?;
        } else {
            session.remove(ID_KEY);
        }
        session.renew();
        Ok(())
    }
}

impl Deref for CurrentUser {
    type Target = noted_db::models::User;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl FromRequest for CurrentUser {
    type Error = NotedError;
    type Future = Ready<Result<CurrentUser, NotedError>>;
    type Config = ();

    #[inline]
    fn from_request(req: &HttpRequest, payload: &mut Payload) -> Self::Future {
        if let Ok(session) = Session::from_request(req, payload).into_inner() {
            if let Ok(Some(current_user_id)) = session.get::<i32>(ID_KEY) {
                if let Ok(db_conn) =
                    web::Data::<DbConnection>::from_request(req, payload).into_inner()
                {
                    if let Ok(db) = db_conn.db() {
                        use noted_db::schema::users;

                        if let Ok(user) = users::table.find(current_user_id).get_result(&db) {
                            return future::ok(CurrentUser(user));
                        }
                    }
                }
            }
        }
        future::err(NotedError::NotLoggedIn)
    }
}
