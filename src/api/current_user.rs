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
use log::error;
use noted_db::models::User;
use noted_db::DbConnection;
use std::ops::Deref;

const ID_KEY: &str = "user_id";
pub struct CurrentUser(User);

pub trait UserSessionExt {
    fn set_user(&self, user: &User) -> Result<(), NotedError>;
    fn clear_user(&self);
}

impl UserSessionExt for Session {
    fn set_user(&self, user: &User) -> Result<(), NotedError> {
        self.set(ID_KEY, user.id)
            .map_err(NotedError::SessionError)?;
        self.renew();
        Ok(())
    }
    fn clear_user(&self) {
        self.remove(ID_KEY);
        self.renew();
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
        match Session::from_request(req, payload).into_inner() {
            Ok(session) => match session.get::<i32>(ID_KEY) {
                Ok(Some(current_user_id)) => {
                    match web::Data::<DbConnection>::from_request(req, payload).into_inner() {
                        Ok(db_conn) => match db_conn.db() {
                            Ok(db) => {
                                use noted_db::schema::users;

                                if let Ok(user) = users::table.find(current_user_id).get_result(&db)
                                {
                                    return future::ok(CurrentUser(user));
                                }
                            }
                            Err(e) => {
                                error!("Could not connect to database for verifying user {:?}", e)
                            }
                        },
                        Err(e) => error!("Unable to get DbConnection from the data {:?}", e),
                    }
                }
                Ok(None) => error!("session key {} not found", ID_KEY),
                Err(e) => error!("Failed while parsing key: {:?}", e),
            },
            Err(e) => error!("Unable to get Session from the data {:?}", e),
        }
        future::err(NotedError::NotLoggedIn)
    }
}
