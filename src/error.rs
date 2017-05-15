use std::convert::From;
use serde_json;
use iron;
use std::error::Error;
use std::fmt;

pub type NResult<T> = Result<T, NotedError>;

#[derive(Debug)]
pub enum NotedError {
    SerdeJson(serde_json::Error),
    Generic(String),
}

impl fmt::Display for NotedError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        use self::NotedError::*;

        match *self {
            SerdeJson(ref e) => write!(f, "Serde Json error: {}", e),
            Generic(ref e) => write!(f, "Generic error: {}", e),
        }
    }
}

impl Error for NotedError {
    fn description(&self) -> &str {
        use self::NotedError::*;

        match *self {
            SerdeJson(_) => "An error from serde_json. Usually from deserialization",
            Generic(_) => "An error that started as a string. Unknown source.",
        }
    }
}

macro_rules! impl_from {
    ($($error:path => $variant:ident),*) => ($(
        impl From<$error> for NotedError {
            fn from(e: $error) -> NotedError {
                NotedError::$variant(e)
            }
        }
    )*)
}

impl_from! {
    serde_json::Error => SerdeJson,
    String => Generic
}

impl Into<iron::IronError> for NotedError {
    fn into(self) -> iron::IronError {
        iron::IronError::new(self, iron::status::InternalServerError)
    }
}
