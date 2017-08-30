use api;
use google;
use iron;
use iron::modifiers::Redirect;
use iron::prelude::*;
use iron_sessionstorage::SessionRequestExt;
use middleware::DieselConnectionExt;
use models::User;
use mount::Mount;
use params::{self, FromValue};
use session::LoginSession;
use staticfile::Static;

pub fn routes() -> Mount {
    let mut mount = Mount::new();
    let main_routes =
        router! {
        oauth: get "/oauth" => oauth,
        api: any "/q/*" => api::routes(),
        index: get "/" => index,
        indox: any "/web/*" => index,
    };
    mount.mount("/", main_routes);
    mount.mount("/assets/", Static::new("assets"));
    mount
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
                           Redirect(oauth.authorize_url()
                                         .expect("Couldn't generate authorize_url")))))
    }
}
