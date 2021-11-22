// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

#[macro_use]
extern crate diesel;

pub mod error;
pub mod models;
#[rustfmt::skip]
pub mod schema;

use {
    diesel::{
        pg::PgConnection,
        r2d2::{ConnectionManager, Pool, PooledConnection},
    },
    dotenv::dotenv,
    lazy_static::lazy_static,
    std::env,
};

lazy_static! {
    static ref CONNECTION_POOL: Pool<ConnectionManager<PgConnection>> = {
        dotenv().ok();

        let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

        Pool::builder()
            .build(ConnectionManager::new(database_url))
            .expect("Unable to create db connection pool")
    };
}

pub fn db() -> Result<PooledConnection<ConnectionManager<PgConnection>>, r2d2::Error> {
    CONNECTION_POOL.get()
}
