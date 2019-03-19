#![cfg_attr(feature = "cargo-clippy", deny(clippy::all))]
#![cfg_attr(feature = "cargo-clippy", deny(clippy::pedantic))]

use {
    clap::clap_app,
    failure::Error,
    iron::{prelude::*, status, AfterMiddleware, Chain},
    mount::Mount,
    staticfile::Static,
    std::fs,
};

struct Custom404;

impl AfterMiddleware for Custom404 {
    fn catch(&self, _: &mut Request, err: IronError) -> IronResult<Response> {
        if let Some(status::NotFound) = err.response.status {
            Ok(Response::with((
                status::NotFound,
                fs::read_to_string("static/404.html").unwrap_or_else(|_| "404".to_owned()),
            )))
        } else {
            Err(err)
        }
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

    let mut mount = Mount::new();
    mount
        .mount("/api/", noted::api::api())
        .mount("/dist/", Static::new("dist"))
        .mount("/", Static::new("dist/index.html"));

    let mut chain = Chain::new(mount);
    chain.link_after(Custom404);

    Iron::new(chain).http(("localhost", port)).unwrap();

    Ok(())
}
