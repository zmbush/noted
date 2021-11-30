// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//

#![cfg_attr(feature = "cargo-clippy", deny(clippy::all))]
#![cfg_attr(feature = "cargo-clippy", deny(clippy::pedantic))]

use actix_files::Files;
use actix_redis::RedisSession;
use actix_web::{App, HttpServer};
use clap::clap_app;
use failure::Error;
use noted_db::DbConnection;

#[actix_web::main]
async fn main() -> Result<(), Error> {
    fern::Dispatch::new()
        .format(|out, message, record| {
            out.finish(format_args!(
                "{}[{}][{}] {}",
                chrono::Local::now().format("[%Y-%m-%d][%H:%M:%S]"),
                record.target(),
                record.level(),
                message
            ));
        })
        .level(log::LevelFilter::Info)
        .level_for("noted", log::LevelFilter::Trace)
        .chain(std::io::stdout())
        .apply()?;

    let matches = clap_app! {
        noted =>
            (version: env!("CARGO_PKG_VERSION"))
            (author: env!("CARGO_PKG_AUTHORS"))
            (about: env!("CARGO_PKG_DESCRIPTION"))
            (@arg PORT: -p --port +takes_value "The port")
            (@arg SECURE: -s --secure "If the session should be secure")
    }
    .get_matches();

    let port = matches
        .value_of("PORT")
        .and_then(|p| p.parse().ok())
        .unwrap_or(8088);

    let db = DbConnection::default();

    println!("Starting actix-web at port {}", port);
    Ok(HttpServer::new(move || {
        App::new()
            .wrap(RedisSession::new("127.0.0.1:6379", &[0; 32]))
            .service(noted::api::service(db.clone()))
            .service(
                Files::new("/", "dist")
                    .use_last_modified(true)
                    .index_file("index.html"),
            )
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await?)
}

#[cfg(test)]
mod test {
    use actix_session::CookieSession;
    use actix_web::{client::ClientRequest, test};
    use cookie::{Cookie, CookieJar};
    use http::HeaderValue;
    use noted_db::models::{NewNote, NoteWithTags, UpdateNote, User};
    use serde::Deserialize;
    use serde_json::json;

    use super::*;

    async fn setup(already_signed_in: bool) -> TestClient {
        let db = DbConnection::new_for_testing();
        let server = test::start(move || {
            App::new()
                .wrap(CookieSession::signed(&[0; 32]))
                .service(noted::api::service(db.clone()))
        });
        TestClient::new(server, already_signed_in).await
    }

    #[derive(Deserialize, Debug)]
    struct ApiError {
        code: u16,
        error: Option<String>,
    }

    #[derive(Deserialize, Debug)]
    struct ApiStatus {
        status: String,
    }

    struct TestClient {
        server: actix_web::test::TestServer,
        cookie_jar: CookieJar,
    }

    impl TestClient {
        async fn new(server: actix_web::test::TestServer, already_signed_in: bool) -> Self {
            let mut cli = TestClient {
                server,
                cookie_jar: CookieJar::new(),
            };

            if already_signed_in {
                cli.sign_up("test@test.com", "Testy McTestFace")
                    .await
                    .expect("Unable to create test user");
            }

            cli
        }

        async fn handle_result<D: serde::de::DeserializeOwned, S: serde::ser::Serialize>(
            cookie_jar: &mut CookieJar,
            mut req: ClientRequest,
            body: &S,
        ) -> Result<D, ApiError> {
            let headers = req.headers_mut();
            for cookie in cookie_jar.iter() {
                println!("Setting header: {}", cookie.stripped());
                headers.append(
                    hyper::header::COOKIE,
                    HeaderValue::from_str(&format!("{}", cookie.stripped())).unwrap(),
                );
            }
            let mut response = req.send_json(body).await.unwrap();
            for cookie in response.headers().get_all(hyper::header::SET_COOKIE) {
                cookie_jar
                    .add_original(Cookie::parse(cookie.to_str().unwrap().to_owned()).unwrap());
            }
            println!("Status: {}", response.status());
            let status = response.status();
            let body = String::from_utf8(response.body().await.unwrap().to_vec()).unwrap();
            println!("Parsing result: {}", body);
            serde_json::from_str::<D>(&body).map_err(|_| {
                serde_json::from_str::<ApiError>(&body).unwrap_or_else(|_| ApiError {
                    code: status.as_u16(),
                    error: Some(body),
                })
            })
        }

        async fn get_user(&mut self) -> Result<User, ApiError> {
            TestClient::handle_result(&mut self.cookie_jar, self.server.get("/api/get_user"), &"")
                .await
        }

        async fn sign_up<E: AsRef<str>, N: AsRef<str>>(
            &mut self,
            email: E,
            name: N,
        ) -> Result<User, ApiError> {
            TestClient::handle_result(
                &mut self.cookie_jar,
                self.server.put("/api/sign_up"),
                &json!({
                    "email": email.as_ref(),
                    "password": "pass",
                    "name": name.as_ref()
                }),
            )
            .await
        }

        async fn sign_in<E: AsRef<str>>(&mut self, email: E) -> Result<User, ApiError> {
            TestClient::handle_result(
                &mut self.cookie_jar,
                self.server.post("/api/sign_in"),
                &json!({
                    "email": email.as_ref(),
                    "password": "pass",
                }),
            )
            .await
        }

        async fn sign_out(&mut self) -> Result<String, ApiError> {
            TestClient::handle_result(&mut self.cookie_jar, self.server.post("/api/sign_out"), &"")
                .await
        }

        async fn new_note(&mut self, note: &NewNote) -> Result<NoteWithTags, ApiError> {
            TestClient::handle_result(
                &mut self.cookie_jar,
                self.server.put("/api/secure/note"),
                note,
            )
            .await
        }

        async fn list_notes(&mut self) -> Result<Vec<NoteWithTags>, ApiError> {
            TestClient::handle_result(
                &mut self.cookie_jar,
                self.server.get("/api/secure/notes"),
                &"",
            )
            .await
        }

        async fn delete_note(&mut self, id: i32) -> Result<ApiStatus, ApiError> {
            TestClient::handle_result(
                &mut self.cookie_jar,
                self.server.delete(format!("/api/secure/notes/{}", id)),
                &"",
            )
            .await
        }

        async fn update_note(
            &mut self,
            id: i32,
            update: &UpdateNote,
        ) -> Result<NoteWithTags, ApiError> {
            TestClient::handle_result(
                &mut self.cookie_jar,
                self.server.patch(format!("/api/secure/notes/{}", id)),
                update,
            )
            .await
        }

        async fn set_tags<'a, Tags: AsRef<[&'a str]>>(
            &mut self,
            id: i32,
            tags: Tags,
        ) -> Result<NoteWithTags, ApiError> {
            TestClient::handle_result(
                &mut self.cookie_jar,
                self.server.put(format!("/api/secure/notes/{}/tags", id)),
                &tags.as_ref(),
            )
            .await
        }
    }

    #[actix_rt::test]
    async fn test_sign_up() {
        let mut client = setup(false).await;

        let get_user_err = client.get_user().await.err().unwrap();
        assert_eq!(get_user_err.code, 401);
        assert_eq!(get_user_err.error.unwrap(), "NotLoggedIn");

        let new_user = client
            .sign_up("test@test.com", "Testy McTestFace")
            .await
            .unwrap();
        assert_eq!(new_user.email, "test@test.com");
        assert_eq!(new_user.name, "Testy McTestFace");

        let user = client.get_user().await.unwrap();
        assert_eq!(user.email, "test@test.com");
        assert_eq!(user.name, "Testy McTestFace");
    }

    #[actix_rt::test]
    async fn test_sign_in() {
        let mut client = setup(true).await;

        client.sign_out().await.unwrap();
        let user = client.sign_in("test@test.com").await.unwrap();
        assert_eq!(user.email, "test@test.com");
        assert_eq!(user.name, "Testy McTestFace");
    }

    #[actix_rt::test]
    async fn test_add_note() {
        let mut client = setup(true).await;

        let note = client
            .new_note(&NewNote {
                title: "Note 1".to_owned(),
                body: "Simple body".to_owned(),
                parent_note_id: None,
            })
            .await
            .unwrap();

        assert_eq!(note.title, "Note 1");
        assert_eq!(note.body, "Simple body");
    }

    #[actix_rt::test]
    async fn test_list_notes() {
        let mut client = setup(true).await;

        for i in 0..10 {
            client
                .new_note(&NewNote {
                    title: format!("Note {}", i),
                    ..NewNote::default()
                })
                .await
                .unwrap();
        }

        let notes = client.list_notes().await.unwrap();
        assert_eq!(notes.len(), 10);
    }

    #[actix_rt::test]
    async fn test_delete_note() {
        let mut client = setup(true).await;

        client
            .new_note(&NewNote {
                title: "The Note To Keep".to_string(),
                ..NewNote::default()
            })
            .await
            .unwrap();
        let note_id = client
            .new_note(&NewNote {
                title: "The Note To Delete".to_string(),
                ..NewNote::default()
            })
            .await
            .unwrap()
            .id;

        assert_eq!(client.list_notes().await.unwrap().len(), 2);
        assert_eq!(client.delete_note(note_id).await.unwrap().status, "ok");

        let notes = client.list_notes().await.unwrap();
        assert_eq!(notes.len(), 1);
        assert_eq!(notes[0].title, "The Note To Keep");
    }

    #[actix_rt::test]
    async fn test_set_tags() {
        let mut client = setup(true).await;

        let note_id = client
            .new_note(&NewNote {
                title: "The Note".to_string(),
                ..NewNote::default()
            })
            .await
            .unwrap()
            .id;

        let note = client.set_tags(note_id, &["tag1", "tag2"]).await.unwrap();

        assert_eq!(note.tags.len(), 2);
        assert!(note.tags.contains(&"tag1".to_owned()));
        assert!(note.tags.contains(&"tag2".to_owned()));
    }

    #[actix_rt::test]
    async fn test_update_note() {
        let mut client = setup(true).await;
        let note = client
            .new_note(&NewNote {
                title: "title".into(),
                ..NewNote::default()
            })
            .await
            .unwrap();
        assert_eq!(note.title, "title");
        let updated = client
            .update_note(
                note.id,
                &UpdateNote {
                    title: Some("Title".into()),
                    ..UpdateNote::default()
                },
            )
            .await
            .unwrap();

        assert_eq!(updated.title, "Title");
    }
}
