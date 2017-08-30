
use diesel;
use iron;
use serde_json;
use std::convert::From;
use std::error::Error;
use std::fmt;

pub type NResult<T> = Result<T, NotedError>;

#[derive(Debug)]
pub enum SafeError {
    SerdeJson(serde_json::Error),
    Generic(String),
    ValueRequiredError(String),
    NotAuthorized,
    Diesel(diesel::result::Error),
}

#[derive(Debug)]
pub enum NotedError {
    Safe(SafeError),
    Iron(iron::IronError),
}

impl fmt::Display for SafeError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        use self::SafeError::*;

        match *self {
            SerdeJson(ref e) => write!(f, "Serde Json error: {}", e),
            Generic(ref e) => write!(f, "Generic error: {}", e),
            NotAuthorized => write!(f, "not authorized"),
            ValueRequiredError(ref e) => write!(f, "Required value not specified: {}", e),
            Diesel(ref e) => write!(f, "Diesel error: {}", e),
        }
    }
}

impl Error for SafeError {
    fn description(&self) -> &str {
        use self::SafeError::*;

        match *self {
            SerdeJson(_) => "An error from serde_json. Usually from deserialization",
            Generic(_) => "An error that started as a string. Unknown source.",
            NotAuthorized => "Not authorized to access asset",
            ValueRequiredError(_) => "A required value was not specified",
            Diesel(_) => "A database error",
        }
    }
}

macro_rules! impl_from {
    ($($error:path => $variant:ident),*) => ($(
        impl From<$error> for NotedError {
            fn from(e: $error) -> NotedError {
                NotedError::Safe(SafeError::$variant(e))
            }
        }
    )*)
}

impl_from! {
    serde_json::Error => SerdeJson,
    String => Generic,
    diesel::result::Error => Diesel
}

impl From<iron::IronError> for NotedError {
    fn from(e: iron::IronError) -> NotedError { NotedError::Iron(e) }
}

impl Into<iron::IronError> for NotedError {
    fn into(self) -> iron::IronError {
        use self::NotedError::*;

        match self {
            Safe(e) => e.into(),
            Iron(e) => e,
        }
    }
}

impl Into<iron::IronError> for SafeError {
    fn into(self) -> iron::IronError {
        use self::SafeError::*;

        let status = match self {
            NotAuthorized => iron::status::Unauthorized,
            _ => iron::status::InternalServerError,
        };
        iron::IronError::new(self, status)
    }
}
