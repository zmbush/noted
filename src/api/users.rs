use iron::prelude::*;
use iron;
use models;
use api::handler::APIHandler;
use middleware::DbInstance;
use auth::CurrentUserExt;
use error::{NotedError, SafeError};

handler!(Profile: models::User, |req: &mut Request, _: DbInstance| {
    req.current_user()?
        .ok_or(NotedError::Safe(SafeError::NotAuthorized))
});
