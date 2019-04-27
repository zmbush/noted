#![cfg_attr(feature = "cargo-clippy", deny(clippy::all))]
#![cfg_attr(feature = "cargo-clippy", deny(clippy::pedantic))]

use {
    clap::clap_app,
    failure::Error,
    futures::{future, Future},
    gotham::{
        self,
        middleware::session::{
            Backend, NewBackend, NewSessionMiddleware, SessionError, SessionIdentifier,
        },
        pipeline::{new_pipeline, single::single_pipeline},
        router::{builder::*, response::extender::ResponseExtender},
        state::State,
    },
    http::response::Response,
    lazy_static::lazy_static,
    redis::Commands,
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
struct RedisBackendProvider(redis::Client);

struct RedisBackend(redis::Connection);

impl RedisBackend {
    fn set_expiry(&self, identifier: &SessionIdentifier) -> Result<(), SessionError> {
        self.0
            .expire(&identifier.value, 60 * 60 * 24 * 5) // 5 Days from last request
            .map_err(|e| SessionError::Backend(format!("{}", e)))
    }
}

impl Backend for RedisBackend {
    fn persist_session(
        &self,
        identifier: SessionIdentifier,
        content: &[u8],
    ) -> Result<(), SessionError> {
        self.0
            .set(&identifier.value, content)
            .map_err(|e| SessionError::Backend(format!("{}", e)))?;

        self.set_expiry(&identifier)
    }

    fn read_session(
        &self,
        identifier: SessionIdentifier,
    ) -> Box<dyn Future<Item = Option<Vec<u8>>, Error = SessionError> + Send> {
        let _ = self.set_expiry(&identifier);

        Box::new(match self.0.get(identifier.value) {
            Ok(v) => future::ok(v),
            Err(e) => future::err(SessionError::Backend(format!("{}", e))),
        })
    }

    fn drop_session(&self, identifier: SessionIdentifier) -> Result<(), SessionError> {
        self.0
            .del(identifier.value)
            .map_err(|e| SessionError::Backend(format!("{}", e)))
    }
}

impl RedisBackendProvider {
    fn new<T: redis::IntoConnectionInfo>(params: T) -> redis::RedisResult<Self> {
        Ok(Self(redis::Client::open(params)?))
    }
}

impl NewBackend for RedisBackendProvider {
    type Instance = RedisBackend;

    fn new_backend(&self) -> std::io::Result<RedisBackend> {
        Ok(RedisBackend(self.0.get_connection().map_err(|e| {
            std::io::Error::new(std::io::ErrorKind::ConnectionRefused, e)
        })?))
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
    simple_logger::init().unwrap();

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

    let mut favicons = Vec::new();
    for file in std::fs::read_dir("static/favicon")? {
        favicons.push(file?.file_name());
    }

    let middleware = {
        let mid = NewSessionMiddleware::new(RedisBackendProvider::new("redis://127.0.0.1")?)
            .with_session_type::<noted::AppData>();

        if matches.is_present("SECURE") {
            mid
        } else {
            mid.insecure()
        }
    };

    let (chain, pipelines) = single_pipeline(new_pipeline().add(middleware).build());

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

    gotham::start(("0.0.0.0", port), router);

    Ok(())
}
