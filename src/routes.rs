use mount::Mount;
use api;
use iron;
use iron::prelude::*;

pub fn routes() -> Mount {
    let mut mount = Mount::new();
    mount.mount("/api/", api::routes()).mount("/", router! {
        index: get "/" => index
    });
    mount
}

fn index(_: &mut Request) -> IronResult<Response> {
    Ok(Response::with((iron::status::Ok, "stuff")))
}
