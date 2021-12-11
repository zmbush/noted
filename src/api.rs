// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//

use actix_web::web;
use noted_db::DbConnection;

mod current_user;
mod notes;
mod user;

use notes::NoteScopeExt;
use user::UserScopeExt;

pub fn scope(db: DbConnection) -> actix_web::Scope {
    web::scope("/api")
        .data(db)
        .add_user_routes()
        .service(web::scope("/secure").add_note_routes())
}

#[cfg(test)]
mod test {
    use crate::error::ErrorData;

    use super::*;
    use actix_http::{
        body::{Body, MessageBody},
        Request,
    };
    use actix_session::CookieSession;
    use actix_web::{
        dev::{Service, ServiceResponse},
        test, App,
    };
    use cookie::{Cookie, CookieJar};
    use http::HeaderValue;
    use noted_db::{
        models::{NewNote, NewUserRequest, NoteWithTags, SignIn, UpdateNote, User},
        DbConnection,
    };
    use serde::Deserialize;
    use serde_json::json;

    async fn setup(
        create_test_user: bool,
    ) -> (
        impl Service<Request = Request, Response = ServiceResponse<Body>, Error = actix_web::Error>,
        cookie::CookieJar,
    ) {
        let db = DbConnection::new_for_testing();
        if create_test_user {
            User::sign_up(
                NewUserRequest {
                    email: "test@test.com".into(),
                    password: "pass".into(),
                    name: "".into(),
                },
                &db.db().unwrap(),
            )
            .unwrap();
        }
        (
            test::init_service(
                App::new()
                    .wrap(CookieSession::signed(&[0; 32]))
                    .service(scope(db)),
            )
            .await,
            CookieJar::default(),
        )
    }

    #[derive(Deserialize, Debug)]
    struct ApiStatus {
        status: String,
    }

    async fn send<O, B, E, S>(
        svc: &mut S,
        cookies: &mut cookie::CookieJar,
        req: test::TestRequest,
    ) -> Result<O, ErrorData>
    where
        S: Service<Request = Request, Response = ServiceResponse<B>, Error = E>,
        B: MessageBody + Unpin,
        E: std::fmt::Debug,
        O: serde::de::DeserializeOwned,
    {
        send_or_other(svc, cookies, req).await
    }

    async fn send_or_other<O, B, E, S, Error>(
        svc: &mut S,
        cookies: &mut cookie::CookieJar,
        mut req: test::TestRequest,
    ) -> Result<O, Error>
    where
        S: Service<Request = Request, Response = ServiceResponse<B>, Error = E>,
        B: MessageBody + Unpin,
        E: std::fmt::Debug,
        O: serde::de::DeserializeOwned,
        Error: serde::de::DeserializeOwned,
    {
        for cookie in cookies.iter() {
            println!("Setting header: {}", cookie.stripped());
            req = req.header(
                hyper::header::COOKIE,
                HeaderValue::from_str(&format!("{}", cookie.stripped())).unwrap(),
            );
        }
        let req = req.to_request();
        println!("Sending: {:?}", req);
        let resp = test::call_service(svc, req).await;
        for cookie in resp.headers().get_all(hyper::header::SET_COOKIE) {
            println!("Saving cookie: {:?}", cookie);
            cookies.add_original(Cookie::parse(cookie.to_str().unwrap().to_owned()).unwrap());
        }
        let body = String::from_utf8(test::read_body(resp).await.to_vec()).unwrap();
        serde_json::from_str::<O>(&body).map_err(|_| {
            serde_json::from_str::<Error>(&body).expect("Could not parse data or error")
        })
    }

    #[actix_rt::test]
    async fn test_sign_up() {
        let (mut svc, mut cookies) = setup(false).await;
        let user: User = send(
            &mut svc,
            &mut cookies,
            test::TestRequest::put()
                .uri("/api/sign_up")
                .set_json(&json!({
                    "email": "test@test.com",
                    "name": "Test",
                    "password": "pass",
                })),
        )
        .await
        .unwrap();
        assert_eq!(user.email, "test@test.com");
    }

    #[actix_rt::test]
    async fn test_sign_in() {
        let (mut svc, mut cookies) = setup(true).await;
        let user: User = send(
            &mut svc,
            &mut cookies,
            test::TestRequest::post()
                .uri("/api/sign_in")
                .set_json(&SignIn {
                    email: "test@test.com".into(),
                    password: "pass".into(),
                }),
        )
        .await
        .unwrap();
        assert_eq!(user.email, "test@test.com");
    }

    #[actix_rt::test]
    async fn test_sign_out() {
        let (mut svc, mut cookies) = setup(true).await;
        send::<User, _, _, _>(
            &mut svc,
            &mut cookies,
            test::TestRequest::post()
                .uri("/api/sign_in")
                .set_json(&json!({
                    "email": "test@test.com",
                    "password": "pass"
                })),
        )
        .await
        .unwrap();

        let user: User = send(
            &mut svc,
            &mut cookies,
            test::TestRequest::get().uri("/api/get_user"),
        )
        .await
        .unwrap();
        assert_eq!(user.email, "test@test.com");
        let resp: String = send(
            &mut svc,
            &mut cookies,
            test::TestRequest::post().uri("/api/sign_out"),
        )
        .await
        .unwrap();
        assert_eq!(resp, "ok");
        let resp = send_or_other::<User, _, _, _, serde_json::value::Value>(
            &mut svc,
            &mut cookies,
            test::TestRequest::get().uri("/api/get_user"),
        )
        .await
        .unwrap_err();
        assert_eq!(resp, json!({}));
    }

    #[actix_rt::test]
    async fn test_new_note() {
        let (mut svc, mut cookies) = setup(true).await;
        send::<User, _, _, _>(
            &mut svc,
            &mut cookies,
            test::TestRequest::post()
                .uri("/api/sign_in")
                .set_json(&json!({
                    "email": "test@test.com",
                    "password": "pass"
                })),
        )
        .await
        .unwrap();

        let note: NoteWithTags = send(
            &mut svc,
            &mut cookies,
            test::TestRequest::put()
                .uri("/api/secure/note")
                .set_json(&NewNote {
                    title: "New Note".into(),
                    body: "body".into(),
                    parent_note_id: None,
                }),
        )
        .await
        .unwrap();

        assert_eq!(note.title, "New Note");
    }

    #[actix_rt::test]
    async fn test_list_notes() {
        let (mut svc, mut cookies) = setup(true).await;
        send::<User, _, _, _>(
            &mut svc,
            &mut cookies,
            test::TestRequest::post()
                .uri("/api/sign_in")
                .set_json(&json!({
                    "email": "test@test.com",
                    "password": "pass"
                })),
        )
        .await
        .unwrap();

        for i in 0..10 {
            send::<NoteWithTags, _, _, _>(
                &mut svc,
                &mut cookies,
                test::TestRequest::put()
                    .uri("/api/secure/note")
                    .set_json(&NewNote {
                        title: format!("New Note {}", i),
                        body: "body".into(),
                        parent_note_id: None,
                    }),
            )
            .await
            .unwrap();
        }

        let notes: Vec<NoteWithTags> = send(
            &mut svc,
            &mut cookies,
            test::TestRequest::get().uri("/api/secure/notes"),
        )
        .await
        .unwrap();
        assert_eq!(notes.len(), 10);
    }

    #[actix_rt::test]
    async fn test_update_note() {
        let (mut svc, mut cookies) = setup(true).await;
        send::<User, _, _, _>(
            &mut svc,
            &mut cookies,
            test::TestRequest::post()
                .uri("/api/sign_in")
                .set_json(&json!({
                    "email": "test@test.com",
                    "password": "pass"
                })),
        )
        .await
        .unwrap();

        let note: NoteWithTags = send(
            &mut svc,
            &mut cookies,
            test::TestRequest::put()
                .uri("/api/secure/note")
                .set_json(&NewNote {
                    title: format!("New Note {}", 1),
                    body: "body".into(),
                    parent_note_id: None,
                }),
        )
        .await
        .unwrap();

        let note: NoteWithTags = send(
            &mut svc,
            &mut cookies,
            test::TestRequest::patch()
                .uri(&format!("/api/secure/notes/{}", note.id))
                .set_json(&UpdateNote {
                    title: Some("New Title".into()),
                    ..UpdateNote::default()
                }),
        )
        .await
        .unwrap();

        assert_eq!(note.title, "New Title");
    }

    #[actix_rt::test]
    async fn test_delete_note() {
        let (mut svc, mut cookies) = setup(true).await;
        send::<User, _, _, _>(
            &mut svc,
            &mut cookies,
            test::TestRequest::post()
                .uri("/api/sign_in")
                .set_json(&json!({
                    "email": "test@test.com",
                    "password": "pass"
                })),
        )
        .await
        .unwrap();

        let note: NoteWithTags = send(
            &mut svc,
            &mut cookies,
            test::TestRequest::put()
                .uri("/api/secure/note")
                .set_json(&NewNote {
                    title: "Note to Delete".into(),
                    body: "body".into(),
                    parent_note_id: None,
                }),
        )
        .await
        .unwrap();

        send::<NoteWithTags, _, _, _>(
            &mut svc,
            &mut cookies,
            test::TestRequest::put()
                .uri("/api/secure/note")
                .set_json(&NewNote {
                    title: "Note to Keep".into(),
                    body: "body".into(),
                    parent_note_id: None,
                }),
        )
        .await
        .unwrap();

        let notes: Vec<NoteWithTags> = send(
            &mut svc,
            &mut cookies,
            test::TestRequest::get().uri("/api/secure/notes"),
        )
        .await
        .unwrap();
        assert_eq!(notes.len(), 2);

        let stat: ApiStatus = send(
            &mut svc,
            &mut cookies,
            test::TestRequest::delete().uri(&format!("/api/secure/notes/{}", note.id)),
        )
        .await
        .unwrap();
        assert_eq!(stat.status, "ok");

        let notes: Vec<NoteWithTags> = send(
            &mut svc,
            &mut cookies,
            test::TestRequest::get().uri("/api/secure/notes"),
        )
        .await
        .unwrap();
        assert_eq!(notes.len(), 1);
        assert_eq!(notes[0].title, "Note to Keep");
    }
}
