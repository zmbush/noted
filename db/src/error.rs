// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

use diesel::result::{DatabaseErrorInformation, DatabaseErrorKind, Error};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, JsonSchema, Debug, Default)]
#[schemars(deny_unknown_fields)]
pub struct ErrorData<'a> {
    pub code: u16,
    pub error: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<&'a str>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub hint: Option<&'a str>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub table_name: Option<&'a str>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub column_name: Option<&'a str>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub constraint_name: Option<&'a str>,
}

macro_rules! impl_noted_db_error {
    ($($type:ident => $inner:ty),*) =>{
        #[derive(Debug)]
        pub enum DbError {
            NotFound,
            NotLoggedIn,
            UnknownDiesel(Error),
            DatabaseError(DatabaseErrorKind, Box<dyn DatabaseErrorInformation+Send+Sync>),
            $($type($inner)),*
        }

        $(
            impl From<$inner> for DbError {
                fn from(e: $inner) -> Self {
                    DbError::$type(e)
                }
            }
        )*

        impl std::fmt::Display for DbError {
            fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                use DbError::*;
                match *self {
                    NotFound => write!(f, "record not found"),
                    NotLoggedIn => write!(f, "not logged in"),
                    UnknownDiesel(ref e) => write!(f, "UnknownDiesel: {}", e),
                    DatabaseError(e, ref m) => write!(f, "DatabaseError({:?}): {}", e, m.message()),
                    $(
                        $type(ref e) => write!(f, "{}: {}", stringify!($type), e)
                    ),*
                }
            }
        }

        impl std::error::Error for DbError {
        }

    };

    ($($type:ident => $inner:ty),*,) => {
        impl_noted_db_error!($($type => $inner),*);
    };
}

pub type Result<T> = std::result::Result<T, DbError>;

impl_noted_db_error! {
    R2D2 => r2d2::Error,
    IOError => std::io::Error,
    SerdeJson => serde_json::Error
}

impl From<Error> for DbError {
    fn from(e: Error) -> DbError {
        match e {
            Error::DatabaseError(k, d) => DbError::DatabaseError(k, d),
            Error::NotFound => DbError::NotFound,
            e => DbError::UnknownDiesel(e),
        }
    }
}

impl DbError {
    pub fn code(&self) -> hyper::StatusCode {
        use {diesel::result::DatabaseErrorKind::*, hyper::StatusCode, DbError::*};

        match *self {
            NotFound => StatusCode::NOT_FOUND,
            NotLoggedIn => StatusCode::UNAUTHORIZED,
            UnknownDiesel(_) => StatusCode::SERVICE_UNAVAILABLE,
            DatabaseError(kind, _) => match kind {
                UniqueViolation | ForeignKeyViolation => StatusCode::BAD_REQUEST,
                _ => StatusCode::INTERNAL_SERVER_ERROR,
            },
            _ => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    pub fn to_json(&self) -> String {
        serde_json::to_string(&match *self {
            DbError::DatabaseError(_, ref info) => ErrorData {
                code: self.code().as_u16(),
                error: info.message().into(),
                details: info.details(),
                hint: info.hint(),
                table_name: info.table_name(),
                column_name: info.column_name(),
                constraint_name: info.constraint_name(),
            },
            ref s => ErrorData {
                code: s.code().as_u16(),
                error: format!("{:?}", s),
                ..ErrorData::default()
            },
        })
        .unwrap_or_else(|_| r#"{"error": "serialize failed"}"#.to_owned())
    }
}

#[cfg(test)]
mod test {
    use {super::*, hyper::StatusCode};

    #[test]
    fn test_code() {
        assert_eq!(DbError::NotFound.code(), StatusCode::NOT_FOUND);
        assert_eq!(DbError::NotLoggedIn.code(), StatusCode::UNAUTHORIZED);
    }

    #[test]
    fn test_to_json() {
        assert_eq!(
            DbError::NotFound.to_json(),
            r#"{"code":404,"error":"NotFound"}"#.to_owned()
        );
        assert_eq!(
            DbError::NotLoggedIn.to_json(),
            r#"{"code":401,"error":"NotLoggedIn"}"#.to_owned()
        );
    }
}
