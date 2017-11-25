use api::handler::APIHandler;
use auth::CurrentUserExt;
use error::{NotedError, SafeError};
use iron;
use iron::prelude::*;
use middleware::DbInstance;
use models;

handler!(Profile: models::User, |req: &mut Request, _: DbInstance| {
    req.current_user()?
        .ok_or(NotedError::Safe(SafeError::NotAuthorized))
});
