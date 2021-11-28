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
    r2d2::{ConnectionManager, Pool, PooledConnection},
    Connection,
};
use dotenv::dotenv;
use gotham::state::StateData;
use std::env;
use std::sync::{Arc, Mutex};

trait DbBackend {
    fn db(
        &self,
    ) -> Result<Arc<Mutex<PooledConnection<ConnectionManager<PgConnection>>>>, r2d2::Error>;
}

#[derive(StateData, Clone)]
pub struct DbConnection {
    pool: Arc<Mutex<Box<dyn DbBackend + Send>>>,
}

impl DbBackend for Pool<ConnectionManager<PgConnection>> {
    fn db(
        &self,
    ) -> Result<Arc<Mutex<PooledConnection<ConnectionManager<PgConnection>>>>, r2d2::Error> {
        Ok(Arc::new(Mutex::new(self.get()?)))
    }
}

struct TestingDbBackend {
    conn: Arc<Mutex<PooledConnection<ConnectionManager<PgConnection>>>>,
}

impl TestingDbBackend {
    fn new(pool: Pool<ConnectionManager<PgConnection>>) -> Self {
        let conn = pool.get().unwrap();
        conn.begin_test_transaction()
            .expect("Couldn't start test transaction");
        Self {
            conn: Arc::new(Mutex::new(conn)),
        }
    }
}

impl DbBackend for TestingDbBackend {
    fn db(
        &self,
    ) -> Result<Arc<Mutex<PooledConnection<ConnectionManager<PgConnection>>>>, r2d2::Error> {
        Ok(self.conn.clone())
    }
}

impl Default for DbConnection {
    fn default() -> Self {
        dotenv().ok();
        DbConnection::new(env::var("DATABASE_URL").expect("DATABASE_URL must be set"))
    }
}

impl DbConnection {
    pub fn new<S: Into<String>>(url: S) -> Self {
        DbConnection {
            pool: Arc::new(Mutex::new(Box::new(
                Pool::builder()
                    .build(ConnectionManager::new(url))
                    .expect("Unable to create db connection pool"),
            ))),
        }
    }

    pub fn new_for_testing() -> Self {
        dotenv().ok();
        DbConnection {
            pool: Arc::new(Mutex::new(Box::new(TestingDbBackend::new(
                Pool::builder()
                    .build(ConnectionManager::new(
                        env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
                    ))
                    .expect("Unable to create db connection pool"),
            )))),
        }
    }

    pub fn with_db<
        R,
        F: FnOnce(&PooledConnection<ConnectionManager<PgConnection>>) -> Result<R, error::DbError>,
    >(
        &self,
        inner: F,
    ) -> Result<R, error::DbError> {
        inner(
            &self
                .pool
                .lock()
                .expect("poisoned lock")
                .db()?
                .lock()
                .expect("poisoned lock"),
        )
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
