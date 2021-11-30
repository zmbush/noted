// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

use actix_web::{HttpResponse, ResponseError};
use http::status::StatusCode;
use noted_db::error::ErrorData;
use std::fmt::Display;

macro_rules! impl_noted_error {
    (native { $($native:ident => $native_code:path),* } $($type:ident => ($inner:ty, $code:path)),*) => {
        #[derive(Debug)]
        pub enum NotedError {
            DbError(noted_db::error::DbError),
            $($native),*,
            $($type($inner)),*
        }

        impl NotedError {
            fn code(&self) -> http::status::StatusCode {
                use NotedError::*;

                match self {
                    DbError(_) => StatusCode::SERVICE_UNAVAILABLE,
                    $($native => $native_code),*,
                    $($type(_) => $code),*
                }
            }
        }

        impl Display for NotedError {
            fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                write!(f, "{}", self.code())
            }
        }

        impl ResponseError for NotedError {
            fn status_code(&self) -> StatusCode {
                self.code()
            }

            fn error_response(&self) -> actix_web::HttpResponse {
                use NotedError::*;

                match *self {
                    DbError(ref d) => HttpResponse::build(self.status_code()).body(d.to_json()),
                    _ => {
                        HttpResponse::build(self.status_code()).json(&ErrorData {
                            code: self.code().as_u16(),
                            error: format!("{:?}", self),
                            ..ErrorData::default()
                        })
                    }
                }
            }
        }

        $(
            impl From<$inner> for NotedError {
                fn from(e: $inner) -> Self {
                    NotedError::$type(e)
                }
            }
        )*
    };


    (native { $($native:ident => $native_code:path),*, } $($type:ident => ($inner:ty, $code:path)),*) => {
        impl_noted_error!(native { $($native => $native_code),* } $($type => ($inner, $code)),*);
    };

    (native { $($native:ident => $native_code:path),* } $($type:ident => ($inner:ty, $code:path)),*,) => {
        impl_noted_error!(native { $($native => $native_code),* } $($type => ($inner, $code)),*);
    };

    (native { $($native:ident => $native_code:path),*, } $($type:ident => ($inner:ty, $code:path)),*,) => {
        impl_noted_error!(
            native {
                $($native => $native_code),*
            }
            $($type => ($inner, $code)),*
        );
    };
}

impl_noted_error! {
    native {
        NotLoggedIn => StatusCode::UNAUTHORIZED,
        SessionError => StatusCode::SERVICE_UNAVAILABLE,
    }
    SerdeJson => (serde_json::Error, StatusCode::BAD_REQUEST),
    DieselResult => (diesel::result::Error, StatusCode::BAD_REQUEST),
    R2D2 => (r2d2::Error, StatusCode::SERVICE_UNAVAILABLE),
    NotFound => (failure::Compat<failure::Error>, StatusCode::NOT_FOUND),
    Hyper => (hyper::Error, StatusCode::INTERNAL_SERVER_ERROR),
    HTTP => (http::Error, StatusCode::INTERNAL_SERVER_ERROR),
    IO => (std::io::Error, StatusCode::SERVICE_UNAVAILABLE),
}

impl From<noted_db::error::DbError> for NotedError {
    fn from(e: noted_db::error::DbError) -> Self {
        NotedError::DbError(e)
    }
}
