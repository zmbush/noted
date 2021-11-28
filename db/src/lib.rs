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

use diesel::{
    pg::PgConnection,
    r2d2::{self, ConnectionManager, CustomizeConnection, Pool, PooledConnection},
    Connection,
};
use dotenv::dotenv;
use gotham::state::StateData;
use std::{
    env,
    sync::{Arc, Mutex},
};

#[derive(StateData, Clone)]
pub struct DbConnection {
    pool: Arc<Mutex<Pool<ConnectionManager<PgConnection>>>>,
}

impl Default for DbConnection {
    fn default() -> Self {
        dotenv().ok();
        DbConnection::new(env::var("DATABASE_URL").expect("DATABASE_URL must be set"))
    }
}

#[derive(Debug)]
struct TestingConnectionCustomizer;
impl CustomizeConnection<PgConnection, r2d2::Error> for TestingConnectionCustomizer {
    fn on_acquire(&self, conn: &mut PgConnection) -> Result<(), r2d2::Error> {
        conn.begin_test_transaction()
            .expect("Unable to start test transaction");
        Ok(())
    }
}

impl DbConnection {
    pub fn new<S: Into<String>>(url: S) -> Self {
        DbConnection {
            pool: Arc::new(Mutex::new(
                Pool::builder()
                    .build(ConnectionManager::new(url))
                    .expect("Unable to create db connection pool"),
            )),
        }
    }

    pub fn new_for_testing() -> Self {
        dotenv().ok();
        DbConnection {
            pool: Arc::new(Mutex::new(
                Pool::builder()
                    .max_size(1)
                    .connection_customizer(Box::new(TestingConnectionCustomizer))
                    .build(ConnectionManager::new(
                        env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
                    ))
                    .expect("Unable to create db connection pool"),
            )),
        }
    }

    pub fn db(&self) -> Result<PooledConnection<ConnectionManager<PgConnection>>, error::DbError> {
        Ok(self
            .pool
            .lock()
            .expect("Database connection pool lock poisoned. Unrecoverable.")
            .get()?)
    }
}

#[cfg(test)]
mod testing {
    use std::env;

    use diesel::{
        r2d2::{ConnectionManager, Pool, PooledConnection},
        PgConnection,
    };

    lazy_static::lazy_static! {
        static ref DB_CONNECTION: Pool<ConnectionManager<PgConnection>> = {
            dotenv::dotenv().ok();
            Pool::builder()
                .build(ConnectionManager::new(
                    env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
                ))
                .expect("Unable to create db connection pool")
        };
    }

    pub(crate) fn db() -> Result<PooledConnection<ConnectionManager<PgConnection>>, r2d2::Error> {
        DB_CONNECTION.get()
    }
}
