use api;
use iron;
use iron::prelude::*;
use router::Router;

pub fn routes() -> Router {
    router! {
        index: get "/" => index,
        api: any "/q/*" => api::routes()
    }
}

fn index(_: &mut Request) -> IronResult<Response> {
    Ok(Response::with((iron::status::Ok, "stuff")))
}
