
use curl::easy::Easy;
use error::{NResult, NotedError, SafeError};
use iron;
use oauth2::{self, Config};
use serde_json;

#[derive(Debug, Deserialize)]
pub struct Web {
    pub client_id: String,
    pub project_id: String,
    pub auth_uri: String,
    pub token_uri: String,
    pub auth_provider_x509_cert_url: String,
    pub client_secret: String,
}

#[derive(Debug, Deserialize)]
pub struct ClientSecret {
    pub web: Web,
}

#[derive(Debug, Deserialize)]
pub struct TokenInfo {
    pub issued_to: String,
    pub audience: String,
    pub scope: String,
    pub expires_in: i32,
    pub user_id: String,
    pub email: String,
    pub verified_email: bool,
}

fn load_secrets() -> NResult<ClientSecret> {
    Ok(serde_json::from_str(include_str!("../client-secret.json"))?)
}

pub struct Oauth {
    oauth: Config,
    secrets: ClientSecret,
}

impl Oauth {
    pub fn new(req: &iron::Request) -> NResult<Oauth> {
        let secrets = load_secrets()?;
        let mut oauth = Config::new(&secrets.web.client_id,
                                    &secrets.web.client_secret,
                                    &secrets.web.auth_uri,
                                    &secrets.web.token_uri);
        oauth.redirect_url = format!("{}", url_for!(req, "oauth"));
        oauth.scopes = vec![
            "openid email https://www.googleapis.com/auth/userinfo.profile"
                .to_owned(),
        ];
        Ok(Oauth { secrets, oauth })
    }

    pub fn authorize_url(&self) -> NResult<iron::Url> {
        let mut generic_url = self.oauth.authorize_url("auth".to_owned());
        generic_url.query_pairs_mut()
                   .append_pair("response_type", "code");
        Ok(iron::Url::from_generic_url(generic_url)?)
    }

    pub fn exchange_code(&self, code: String) -> NResult<oauth2::Token> {
        Ok(self.oauth.exchange_code(code)?)
    }

    pub fn validate_token(&self, token: &oauth2::Token) -> NResult<TokenInfo> {
        let tokeninfo_uri = format!("{}info?access_token={}",
                                    self.secrets.web.token_uri,
                                    token.access_token);
        let mut easy = Easy::new();
        easy.url(&tokeninfo_uri).unwrap();
        let mut data = Vec::new();
        {
            let mut transfer = easy.transfer();
            transfer.write_function(|new_data| {
                                        data.extend_from_slice(new_data);
                                        Ok(new_data.len())
                                    })
                    .unwrap();
            transfer.perform().unwrap();
        }
        let data = String::from_utf8(data).unwrap();
        println!("Got data: {}", data);
        let data: TokenInfo = serde_json::from_str(&data)?;

        if data.issued_to != self.secrets.web.client_id {
            Err(NotedError::Safe(SafeError::Generic("Client id does not match issued to id"
                                                        .to_owned())))
        } else {
            Ok(data)
        }
    }
}
