#![cfg_attr(feature = "cargo-clippy", deny(clippy::all))]
#![cfg_attr(feature = "cargo-clippy", deny(clippy::pedantic))]

use {
    clap::clap_app,
    failure::Error,
    gotham::{self, router::builder::*},
};

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

    let router = build_simple_router(|route| {
        route.delegate("/api").to_router(noted::api::api());
        route.get_or_head("/dist/*").to_dir("dist");
        route.get_or_head("/*").to_file("dist/index.html");
        route.get_or_head("/").to_file("dist/index.html");
    });

    gotham::start(("0.0.0.0", port), router);

    Ok(())
}
