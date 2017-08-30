
use iron;
use iron::{IronError, IronResult, Request, Response};
use middleware::{DbInstance, DieselConnectionExt};
use serde;
use serde_json;

fn json_error(msg: &str) -> String { format!("{{\"error\": \"{}\"}}", msg) }

pub trait APIHandler {
    type Data: serde::Serialize;
    fn get_data(&self, req: &mut Request, conn: DbInstance) -> IronResult<Self::Data>;
    fn process(&self, req: &mut Request) -> IronResult<Response> {
        let conn = req.db_conn()?;
        Ok(Response::with((iron::status::Ok,
         try! {
            serde_json::to_string(&try!(self.get_data(req, conn)))
                .map_err(|e| IronError::new(e, json_error("Serialization Failed")))
        })))
    }
}

macro_rules! resources {
    ($name:ident: $data:ty) => (
        handler!(concat_idents(Get, $name), $data, $body)
    )
}
macro_rules! handler {
    ($name:ident: $data:ty, $body:expr) => (
        pub struct $name;

        impl APIHandler for $name {
            type Data = $data;
            fn get_data(&self, req: &mut Request, conn: DbInstance) -> IronResult<Self::Data> {
               Ok($body(req, conn).map_err(|e| e.into())?)
            }
        }

        impl iron::Handler for $name {
            fn handle(&self, req: &mut Request) -> IronResult<Response> {
                self.process(req)
            }
        }
    )
}
