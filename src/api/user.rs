// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//

use crate::{
    api::current_user::{CurrentUser, UserSessionExt},
    error::NotedError,
};
use actix_session::Session;
use actix_web::{get, post, put, web, HttpResponse};
use noted_db::{
    models::{NewUserRequest, SignIn},
    DbConnection,
};

pub trait UserScopeExt {
    fn add_user_routes(self) -> Self;
}

impl UserScopeExt for actix_web::Scope {
    fn add_user_routes(self) -> Self {
        self.service(sign_in)
            .service(sign_up)
            .service(sign_out)
            .service(get_user)
    }
}

#[put("/sign_up")]
async fn sign_up(
    sign_up: web::Json<NewUserRequest>,
    db_pool: web::Data<DbConnection>,
    session: Session,
) -> Result<HttpResponse, NotedError> {
    use noted_db::models::User;

    let user = User::sign_up(sign_up.into_inner(), &db_pool.db()?)?;
    session.set_user(&user)?;

    Ok(HttpResponse::Ok().json(user))
}

#[post("/sign_in")]
async fn sign_in(
    sign_in: web::Json<SignIn>,
    db_pool: web::Data<DbConnection>,
    session: Session,
) -> Result<HttpResponse, NotedError> {
    use noted_db::models::User;

    match User::sign_in(&*sign_in, &db_pool.db()?) {
        Ok(user) => {
            session
                .set_user(&user)
                .map_err(|_| NotedError::LoginFailed)?;
            Ok(HttpResponse::Ok().json(user))
        }
        Err(_) => Err(crate::error::NotedError::LoginFailed),
    }
}

#[get("/get_user")]
async fn get_user(user: CurrentUser) -> Result<HttpResponse, NotedError> {
    Ok(HttpResponse::Ok().json(&*user))
}

#[post("/sign_out")]
async fn sign_out(session: Session) -> Result<HttpResponse, NotedError> {
    session.clear_user();
    Ok(HttpResponse::Ok().json("ok"))
}
