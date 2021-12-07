// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

use thiserror::Error;

#[derive(Debug, Error)]
pub enum DbError {
    #[error("Database record not found")]
    NotFound,

    #[error("User is not logged in")]
    NotLoggedIn,

    #[error("Connection to Database Pool Failed")]
    R2D2(#[from] r2d2::Error),

    #[error("Unable to read file: {0}")]
    IOError(#[from] std::io::Error),

    #[error("Failed to Parse JSON: {0}")]
    SerdeJson(#[from] serde_json::Error),

    #[error("Unknown diesel error: {0}")]
    UnknownDiesel(diesel::result::Error),

    #[error("Error interacting with database: {0:?}: {}", .1.message())]
    DatabaseError(
        diesel::result::DatabaseErrorKind,
        Box<dyn diesel::result::DatabaseErrorInformation + Send + Sync>,
    ),
}

impl From<diesel::result::Error> for DbError {
    fn from(e: diesel::result::Error) -> DbError {
        use diesel::result::Error::*;
        match e {
            DatabaseError(k, d) => DbError::DatabaseError(k, d),
            NotFound => DbError::NotFound,
            e => DbError::UnknownDiesel(e),
        }
    }
}

pub type Result<T> = std::result::Result<T, DbError>;

impl DbError {
    pub fn status_code(&self) -> hyper::StatusCode {
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
}

#[cfg(test)]
mod test {
    use {super::*, hyper::StatusCode};

    #[test]
    fn test_code() {
        assert_eq!(DbError::NotFound.status_code(), StatusCode::NOT_FOUND);
        assert_eq!(DbError::NotLoggedIn.status_code(), StatusCode::UNAUTHORIZED);
    }
}
