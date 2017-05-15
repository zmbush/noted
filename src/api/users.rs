use iron::prelude::*;
use iron;
use models;
use api::handler::APIHandler;
use middleware::{DbInstance, RouterExt};
use diesel::prelude::*;

handler!(GetUser: models::User,
         |req: &mut Request, conn: DbInstance| {
    use schema::users::dsl;
    let id: i32 = req.params()
        .find("id")
        .and_then(|id| id.parse().ok())
        .unwrap_or(-1);
    dsl::users
        .find(id)
        .get_result(&*conn)
        .map_err(|e| IronError::new(e, "No user found"))
});

handler!(GetUsers: Vec<models::User>,
         |_: &mut Request, conn: DbInstance| {
             use schema::users::dsl;
             dsl::users
                 .get_results(&*conn)
                 .map_err(|e| IronError::new(e, "no users?"))
         });
