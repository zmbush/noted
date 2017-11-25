use diesel::pg::PgConnection;
use iron::{typemap, BeforeMiddleware};
use iron::{IronError, IronResult, Request};
use r2d2;
use r2d2_diesel::ConnectionManager;
use router;
use std::error::Error;

pub type DbInstance = r2d2::PooledConnection<ConnectionManager<PgConnection>>;

#[derive(Clone)]
pub struct DieselConnection {
    pub pool: r2d2::Pool<ConnectionManager<PgConnection>>,
}

impl typemap::Key for DieselConnection {
    type Value = r2d2::Pool<ConnectionManager<PgConnection>>;
}

impl DieselConnection {
    pub fn new(database_url: &str) -> Result<DieselConnection, Box<Error>> {
        let config = r2d2::Config::builder().build();
        let manager = ConnectionManager::<PgConnection>::new(database_url);
        let pool = r2d2::Pool::new(config, manager)?;
        Ok(DieselConnection { pool })
    }
}

impl BeforeMiddleware for DieselConnection {
    fn before(&self, req: &mut Request) -> IronResult<()> {
        req.extensions.insert::<DieselConnection>(self.pool.clone());
        Ok(())
    }
}

pub trait DieselConnectionExt {
    fn db_conn(&self) -> IronResult<r2d2::PooledConnection<ConnectionManager<PgConnection>>>;
}

impl<'a, 'b> DieselConnectionExt for Request<'a, 'b> {
    fn db_conn(&self) -> IronResult<r2d2::PooledConnection<ConnectionManager<PgConnection>>> {
        let pool = self.extensions
            .get::<DieselConnection>()
            .expect("Ext not registered");
        pool.get().map_err(|e| IronError::new(e, "Timeout"))
    }
}

pub trait RouterExt {
    fn params(&self) -> &router::Params;
}

impl<'a, 'b> RouterExt for Request<'a, 'b> {
    fn params(&self) -> &router::Params {
        self.extensions
            .get::<router::Router>()
            .expect("No router middleware registered")
    }
}
