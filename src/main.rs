#![deny(unused_imports, unused)]

#[macro_use]
extern crate diesel;
#[macro_use]
extern crate diesel_codegen;
extern crate iron_sessionstorage;
extern crate r2d2;
extern crate r2d2_diesel;
extern crate serde;
#[macro_use]
extern crate serde_derive;

extern crate curl;
extern crate dotenv;
extern crate env_logger;
extern crate noted_linker;
extern crate serde_json;

#[macro_use]
extern crate iron;
extern crate logger;
extern crate mount;
extern crate oauth2;
extern crate params;
#[macro_use]
extern crate router;
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
mod cache;

use dotenv::dotenv;
use iron::prelude::*;

use iron_sessionstorage::SessionStorage;
use iron_sessionstorage::backends::RedisBackend;
use logger::Logger;
use middleware::DieselConnection;
use std::env;
use std::error::Error;

fn get_routes() -> Result<Chain, Box<Error>> {
    dotenv()?;
    env_logger::init()?;
    let mut chain = Chain::new(routes::routes());
    chain.link_around(SessionStorage::new(RedisBackend::new("redis://127.0.0.1")?));

    let (logger_before, logger_after) = Logger::new(None);
    chain.link_before(logger_before);
    chain.link_after(logger_after);

    let database_url = env::var("DATABASE_URL")?;
    chain.link_before(DieselConnection::new(&database_url)?);

    Ok(chain)
}

fn main() {
    let routes = get_routes().expect("Could not construct routes");
    Iron::new(routes).http("localhost:5005").unwrap();
}
