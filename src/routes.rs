use api;
use iron;
use iron::prelude::*;
use router::Router;
use google;
use iron::modifiers::Redirect;
use params::{self, FromValue};
use iron_sessionstorage::SessionRequestExt;
use session::LoginSession;
use middleware::DieselConnectionExt;
use models::User;

pub fn routes() -> Router {
    router! {
        index: get "/" => index,
        oauth: get "/oauth" => oauth,
        api: any "/q/*" => api::routes()
    }
}

fn oauth(req: &mut Request) -> IronResult<Response> {
    let oauth = google::Oauth::new(req).map_err(|e| e.into())?;
    let code = {
        let params = req.get_ref::<params::Params>()
            .expect("Could not fetch params");
        iexpect!(String::from_value(iexpect!(params.get("code"))))
    };
    let token = oauth.exchange_code(code).map_err(|e| e.into())?;
    let info = oauth.validate_token(&token).map_err(|e| e.into())?;

    let user = User::find_or_create(&info.user_id, &info.email, &*req.db_conn()?);

    if let Ok(user) = user {
        req.session()
            .set(LoginSession {
                     uid: user.id,
                     email: info.email,
                     access_token: token.access_token,
                 })?;
    }

    Ok(Response::with((iron::status::Found, Redirect(url_for!(req, "index")))))
}

fn index(req: &mut Request) -> IronResult<Response> {
    if let Some(user) = req.session().get::<LoginSession>()? {
        Ok(Response::with((iron::status::Ok, format!("Welcome {}", user.email))))
    } else {
        let oauth = google::Oauth::new(req).map_err(|e| e.into())?;
        Ok(Response::with((iron::status::Found,
                           Redirect(oauth
                                        .authorize_url()
                                        .expect("Couldn't generate authorize_url")))))
    }
}
