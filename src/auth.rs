use iron::prelude::*;
use diesel::prelude::*;
use diesel;
use iron::BeforeMiddleware;
use iron_sessionstorage::SessionRequestExt;
use session::LoginSession;
use error::SafeError;
use models::User;
use middleware::DieselConnectionExt;

pub struct HasUser;

pub trait CurrentUserExt {
    fn current_user(&mut self) -> IronResult<Option<User>>;
}
impl<'a, 'b> CurrentUserExt for Request<'a, 'b> {
    fn current_user(&mut self) -> IronResult<Option<User>> {
        if let Some(user) = self.session().get::<LoginSession>()? {
            use schema::users::dsl::*;

            let db = self.db_conn()?;
            match users.find(user.uid).get_result(&*db) {
                Ok(user) => Ok(Some(user)),
                Err(diesel::result::Error::NotFound) => Ok(None),
                Err(e) => Err(IronError::new(e, "Couldn't get user")),
            }
        } else {
            Ok(None)
        }
    }
}

impl BeforeMiddleware for HasUser {
    fn before(&self, req: &mut Request) -> IronResult<()> {
        if let Some(_) = req.current_user()? {
            Ok(())
        } else {
            Err(SafeError::NotAuthorized.into())
        }
    }
}
