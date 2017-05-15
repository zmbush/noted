use serde;
use iron;
use serde_json;
use iron::{IronResult, IronError, Request, Response};
use middleware::{DbInstance, DieselConnectionExt};

fn json_error(msg: &str) -> String {
    format!("{{\"error\": \"{}\"}}", msg)
}

pub trait APIHandler {
    type Data: serde::Serialize;
    fn get_data(&self, req: &mut Request, conn: DbInstance) -> IronResult<Self::Data>;
    fn process(&self, req: &mut Request) -> IronResult<Response> {
        let conn = try!(req.db_conn());
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
                $body(req, conn)
            }
        }

        impl iron::Handler for $name {
            fn handle(&self, req: &mut Request) -> IronResult<Response> {
                self.process(req)
            }
        }
    )
}
