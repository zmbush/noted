#![deny(unused_imports)]

#[macro_use]
extern crate serde_derive;
#[macro_use]
extern crate diesel_codegen;
#[macro_use]
extern crate diesel;
extern crate serde;
extern crate r2d2;
extern crate r2d2_diesel;
extern crate iron_sessionstorage;

extern crate serde_json;
extern crate dotenv;
extern crate env_logger;
extern crate curl;

#[macro_use]
extern crate iron;
#[macro_use]
extern crate router;
extern crate logger;
extern crate params;
extern crate oauth2;
extern crate mount;
extern crate staticfile;

mod schema;
mod models;
mod middleware;
mod api;
mod routes;
mod session;
mod google;
mod error;
mod auth;

use iron::prelude::*;
use logger::Logger;
use dotenv::dotenv;
use std::env;
use middleware::DieselConnection;
use std::error::Error;

use iron_sessionstorage::SessionStorage;
use iron_sessionstorage::backends::RedisBackend;

fn get_routes() -> Result<Chain, Box<Error>> {
    try!(dotenv());
    try!(env_logger::init());
    let mut chain = Chain::new(routes::routes());
    chain.link_around(SessionStorage::new(try!(RedisBackend::new("redis://127.0.0.1"))));

    let (logger_before, logger_after) = Logger::new(None);
    chain.link_before(logger_before);
    chain.link_after(logger_after);

    let database_url = try!(env::var("DATABASE_URL"));
    chain.link_before(try!(DieselConnection::new(&database_url)));

    Ok(chain)
}

fn main() {
    let routes = get_routes().expect("Could not construct routes");
    Iron::new(routes).http("localhost:5005").unwrap();
}
