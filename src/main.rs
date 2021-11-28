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

use std::pin::Pin;

use futures::FutureExt;
use gotham::{
    middleware::session::{GetSessionFuture, MemoryBackend, SetSessionFuture},
    router::Router,
};
use noted_db::DbConnection;

use {
    clap::clap_app,
    failure::Error,
    futures::future,
    gotham::{
        self,
        middleware::session::{
            Backend, NewBackend, NewSessionMiddleware, SessionError, SessionIdentifier,
        },
        pipeline::{new_pipeline, single_pipeline},
        router::{
            builder::{build_router, DefineSingleRoute, DrawRoutes},
            response::ResponseExtender,
        },
        state::State,
    },
    http::response::Response,
    lazy_static::lazy_static,
    redis::Commands,
    std::cell::RefCell,
};

lazy_static! {
    static ref BODY_404: String = {
        use std::{fs::File, io::Read};

        let mut contents = String::new();
        let mut file = File::open("static/404.html").expect("Could not open 404 file");
        file.read_to_string(&mut contents)
            .expect("Could not read 404 response to string");

        contents
    };
}

#[derive(Clone)]
struct RedisBackendProvider(Option<redis::Client>, MemoryBackend);

struct RedisBackend(Option<RefCell<redis::Connection>>, MemoryBackend);

impl RedisBackend {
    fn set_expiry(&self, identifier: &SessionIdentifier) -> Result<(), SessionError> {
        self.0.as_ref().map_or(Ok(()), |redis| {
            redis
                .borrow_mut()
                .expire(&identifier.value, 60 * 60 * 24 * 5) // 5 Days from last request
                .map_err(|e| SessionError::Backend(format!("{}", e)))
        })
    }
}

impl Backend for RedisBackend {
    fn persist_session(
        &self,
        state: &State,
        identifier: SessionIdentifier,
        content: &[u8],
    ) -> Pin<Box<SetSessionFuture>> {
        match self.0 {
            Some(ref redis) => {
                if let Err(e) = redis
                    .borrow_mut()
                    .set::<_, _, String>(&identifier.value, content)
                    .map_err(|e| SessionError::Backend(format!("{}", e)))
                {
                    return future::err(e).boxed();
                }

                match self.set_expiry(&identifier) {
                    Ok(_) => future::ok(()),
                    Err(e) => future::err(e),
                }
                .boxed()
            }
            None => self.1.persist_session(state, identifier, content),
        }
    }

    fn read_session(
        &self,
        state: &State,
        identifier: SessionIdentifier,
    ) -> Pin<Box<GetSessionFuture>> {
        match self.0 {
            Some(ref redis) => {
                std::mem::drop(self.set_expiry(&identifier));

                match redis.borrow_mut().get(identifier.value) {
                    Ok(v) => future::ok(v),
                    Err(e) => future::err(SessionError::Backend(format!("{}", e))),
                }
                .boxed()
            }
            None => self.1.read_session(state, identifier),
        }
    }

    fn drop_session(
        &self,
        state: &State,
        identifier: SessionIdentifier,
    ) -> Pin<Box<SetSessionFuture>> {
        match self.0 {
            Some(ref redis) => match redis
                .borrow_mut()
                .del::<_, String>(identifier.value)
                .map_err(|e| SessionError::Backend(format!("{}", e)))
            {
                Ok(_) => future::ok(()),
                Err(e) => future::err(e),
            }
            .boxed(),
            None => self.1.drop_session(state, identifier),
        }
    }
}

impl RedisBackendProvider {
    fn new<T: redis::IntoConnectionInfo>(params: T) -> Self {
        Self(
            redis::Client::open(params)
                .map_err(|e| {
                    log::error!("Could not connect to redis client: {}", e);
                    e
                })
                .ok(),
            MemoryBackend::default(),
        )
    }
}

impl NewBackend for RedisBackendProvider {
    type Instance = RedisBackend;

    fn new_backend(&self) -> gotham::anyhow::Result<RedisBackend> {
        Ok(RedisBackend(
            self.0
                .as_ref()
                .ok_or(gotham::anyhow::anyhow!("No redis"))
                .and_then(|c| Ok(RefCell::new(c.get_connection()?)))
                .map_err(|e| {
                    log::error!("Could not get connection to redis client: {}", e);
                    e
                })
                .ok(),
            self.1.new_backend()?,
        ))
    }
}

struct NotFoundHandler;

impl ResponseExtender<hyper::Body> for NotFoundHandler {
    fn extend(&self, _state: &mut State, response: &mut Response<hyper::Body>) {
        response.headers_mut().insert(
            hyper::header::CONTENT_TYPE,
            hyper::header::HeaderValue::from_static("text/html"),
        );
        *response.body_mut() = hyper::Body::from(BODY_404.as_str());
    }
}

fn main() -> Result<(), Error> {
    fern::Dispatch::new()
        .format(|out, message, record| {
            if record.target() == "gotham::middleware::logger" {
                out.finish(format_args!("{}", message));
            } else {
                out.finish(format_args!(
                    "{}[{}][{}] {}",
                    chrono::Local::now().format("[%Y-%m-%d][%H:%M:%S]"),
                    record.target(),
                    record.level(),
                    message
                ));
            }
        })
        .level(log::LevelFilter::Info)
        .level_for("noted", log::LevelFilter::Trace)
        .level_for("gotham::middleware::logger", log::LevelFilter::Info)
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

    println!("Starting gotham at port {}", port);
    Ok(gotham::start(
        ("0.0.0.0", port),
        make_router(matches.is_present("SECURE"), db)?,
    )?)
}

fn make_router(secure: bool, db: DbConnection) -> Result<Router, Error> {
    let mut favicons = Vec::new();
    for file in std::fs::read_dir("static/favicon")? {
        favicons.push(file?.file_name());
    }

    let middleware = {
        let mid = NewSessionMiddleware::new(RedisBackendProvider::new("redis://127.0.0.1"))
            .with_session_type::<noted::AppData>();

        if secure {
            mid
        } else {
            mid.insecure()
        }
    };

    let (chain, pipelines) = single_pipeline(
        new_pipeline()
            .add(middleware)
            .add(gotham::middleware::logger::RequestLogger::new(
                log::Level::Info,
            ))
            .add(gotham::middleware::state::StateMiddleware::new(db))
            .build(),
    );

    let router = build_router(chain, pipelines, |route| {
        route.add_response_extender(http::status::StatusCode::NOT_FOUND, NotFoundHandler);
        route.delegate("/api").to_router(noted::api::api());
        route.get_or_head("/dist/*").to_dir("dist");

        for favicon in favicons {
            route
                .get_or_head(&format!("/{}", favicon.to_string_lossy()))
                .to_file(format!("static/favicon/{}", favicon.to_string_lossy()));
        }

        route.get_or_head("/*").to_file("dist/index.html");
        route.get_or_head("/").to_file("dist/index.html");
    });

    Ok(router)
}

#[cfg(test)]
mod test {
    use cookie::{Cookie, CookieJar};
    use gotham::{
        plain::test::TestConnect,
        test::{TestRequest, TestServer},
    };
    use http::HeaderValue;
    use noted_db::models::{NewNote, Note, User};
    use serde::Deserialize;
    use serde_json::json;
    use std::sync::Once;

    use super::*;

    static INIT: Once = Once::new();

    fn setup() -> (TestClient, TestServer) {
        INIT.call_once(|| {
            fern::Dispatch::new()
                .format(|out, message, record| {
                    if record.target() == "gotham::middleware::logger" {
                        out.finish(format_args!("{}", message));
                    } else {
                        out.finish(format_args!(
                            "{}[{}][{}] {}",
                            chrono::Local::now().format("[%Y-%m-%d][%H:%M:%S]"),
                            record.target(),
                            record.level(),
                            message
                        ));
                    }
                })
                .level(log::LevelFilter::Info)
                .level_for("noted", log::LevelFilter::Trace)
                .level_for("gotham::middleware::logger", log::LevelFilter::Info)
                .chain(std::io::stdout())
                .apply()
                .expect("Could not set up dispatcher");
        });

        let db = DbConnection::new_for_testing();
        let router = make_router(false, db).unwrap();
        let server = TestServer::new(move || Ok(router.clone())).unwrap();
        (TestClient::new(server.client()), server)
    }

    #[derive(Deserialize, Debug)]
    struct ApiError {
        code: u32,
        error: Option<String>,
    }

    struct TestClient {
        client: gotham::test::TestClient<TestServer, TestConnect>,
        cookie_jar: CookieJar,
    }

    impl TestClient {
        fn new(client: gotham::test::TestClient<TestServer, TestConnect>) -> Self {
            TestClient {
                client,
                cookie_jar: CookieJar::new(),
            }
        }

        fn handle_result<S: serde::de::DeserializeOwned>(
            cookie_jar: &mut CookieJar,
            mut req: TestRequest<TestServer, TestConnect>,
        ) -> Result<S, ApiError> {
            let headers = req.headers_mut();
            for cookie in cookie_jar.iter() {
                println!("Setting header: {}", cookie.stripped());
                headers.append(
                    hyper::header::COOKIE,
                    HeaderValue::from_str(&format!("{}", cookie.encoded())).unwrap(),
                );
            }
            let response = req.perform().unwrap();
            for cookie in response.headers().get_all(hyper::header::SET_COOKIE) {
                cookie_jar
                    .add_original(Cookie::parse(cookie.to_str().unwrap().to_owned()).unwrap());
            }
            println!("Status: {}", response.status());
            let body = response.read_utf8_body().unwrap();
            println!("Parsing result: {}", body);
            serde_json::from_str::<S>(&body).map_err(|_| {
                serde_json::from_str::<ApiError>(&body)
                    .unwrap_or_else(|_| panic!("could not parse api error as fallback: {}", body))
            })
        }

        fn get_user(&mut self) -> Result<User, ApiError> {
            TestClient::handle_result(
                &mut self.cookie_jar,
                self.client.get("http://localhost/api/get_user"),
            )
        }

        fn sign_up<E: AsRef<str>, N: AsRef<str>>(
            &mut self,
            email: E,
            name: N,
        ) -> Result<User, ApiError> {
            let body = serde_json::to_string(&json!({
                "email": email.as_ref(),
                "password": "pass",
                "name": name.as_ref(),
            }))
            .unwrap();

            println!("Signing up with: {}", body);
            TestClient::handle_result(
                &mut self.cookie_jar,
                self.client.put(
                    "http://localhost/api/sign_up",
                    body,
                    gotham::mime::APPLICATION_JSON,
                ),
            )
        }

        fn sign_in<E: AsRef<str>>(&mut self, email: E) -> Result<User, ApiError> {
            let body = serde_json::to_string(&json!({
                "email": email.as_ref(),
                "password": "pass",
            }))
            .unwrap();

            println!("Signing in with: {}", body);
            TestClient::handle_result(
                &mut self.cookie_jar,
                self.client.post(
                    "http://localhost/api/sign_in",
                    body,
                    gotham::mime::APPLICATION_JSON,
                ),
            )
        }

        fn sign_out(&mut self) -> Result<String, ApiError> {
            TestClient::handle_result(
                &mut self.cookie_jar,
                self.client.post(
                    "http://localhost/api/sign_out",
                    "",
                    gotham::mime::APPLICATION_JSON,
                ),
            )
        }

        fn new_note(&mut self, note: &NewNote) -> Result<Note, ApiError> {
            let body = serde_json::to_string(note).unwrap();
            TestClient::handle_result(
                &mut self.cookie_jar,
                self.client.put(
                    "http://localhost/api/secure/note",
                    body,
                    gotham::mime::APPLICATION_JSON,
                ),
            )
        }
    }

    #[test]
    fn test_sign_up() {
        let (mut client, _server) = setup();

        let get_user_err = client.get_user().err().unwrap();
        assert_eq!(get_user_err.code, 401);
        assert_eq!(get_user_err.error.unwrap(), "not authorized");

        let new_user = client.sign_up("test@test.com", "Testy McTestFace").unwrap();
        assert_eq!(new_user.email, "test@test.com");
        assert_eq!(new_user.name, "Testy McTestFace");

        let user = client.get_user().unwrap();
        assert_eq!(user.email, "test@test.com");
        assert_eq!(user.name, "Testy McTestFace");
    }

    #[test]
    fn test_sign_in() {
        let (mut client, _server) = setup();

        client.sign_up("test@test.com", "Testy McTestFace").unwrap();
        client.sign_out().unwrap();
        let user = client.sign_in("test@test.com").unwrap();
        assert_eq!(user.email, "test@test.com");
        assert_eq!(user.name, "Testy McTestFace");
    }

    #[test]
    fn test_add_note() {
        let (mut client, _server) = setup();

        client.sign_up("test@test.com", "Testy McTestFace").unwrap();
        let note = client
            .new_note(&NewNote {
                title: "Note 1".to_owned(),
                body: "Simple body".to_owned(),
                parent_note_id: None,
            })
            .unwrap();

        assert_eq!(note.title, "Note 1");
        assert_eq!(note.body, "Simple body");
    }
}
