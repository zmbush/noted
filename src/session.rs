use iron_sessionstorage::Value;
use serde_json;
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginSession {
    pub uid:          i64,
    pub email:        String,
    pub access_token: String,
}

impl Value for LoginSession {
    fn get_key() -> &'static str {
        "logged_in_user"
    }
    fn into_raw(self) -> String {
        serde_json::to_string(&self).unwrap_or_else(|_| "".to_owned())
    }
    fn from_raw(value: String) -> Option<Self> {
        if value.is_empty() {
            None
        } else {
            serde_json::from_str(&value).ok()
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct Cache {
    pub page_names: HashMap<String, String>,
}

impl Value for Cache {
    fn get_key() -> &'static str {
        "per_user_cache"
    }
    fn into_raw(self) -> String {
        serde_json::to_string(&self).unwrap_or_else(|_| "".to_owned())
    }
    fn from_raw(value: String) -> Option<Self> {
        if value.is_empty() {
            None
        } else {
            serde_json::from_str(&value).ok()
        }
    }
}
