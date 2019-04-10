#![cfg_attr(feature = "cargo-clippy", deny(clippy::all))]
#![cfg_attr(feature = "cargo-clippy", deny(clippy::pedantic))]

use {
    clap::clap_app,
    failure::Error,
    gotham::{
        self,
        router::{builder::*, response::extender::ResponseExtender},
        state::State,
    },
    http::response::Response,
    lazy_static::lazy_static,
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
    }
    .get_matches();

    let port = matches
        .value_of("PORT")
        .and_then(|p| p.parse().ok())
        .unwrap_or(8088);

    let mut favicons = Vec::new();
    for file in std::fs::read_dir("static/favicon")? {
        favicons.push(file?.path());
    }

    let router = build_simple_router(|route| {
        route.add_response_extender(http::status::StatusCode::NOT_FOUND, NotFoundHandler);
        route.delegate("/api").to_router(noted::api::api());
        route.get_or_head("/dist/*").to_dir("dist");

        for favicon in favicons {
            route
                .get_or_head(&format!("/{}", favicon.display()))
                .to_file(format!("static/favicon/{}", favicon.display()));
        }

        route.get_or_head("/*").to_file("static/index.html");
        route.get_or_head("/").to_file("static/index.html");
    });

    gotham::start(("0.0.0.0", port), router);

    Ok(())
}
