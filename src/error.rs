// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

use gotham::handler::{HandlerError, IntoHandlerError};

pub enum NotedError {
    SerdeJson(serde_json::Error),
    DieselResult(diesel::result::Error),
    R2D2(r2d2::Error),
    NotFound(&'static str),
    Hyper(hyper::error::Error),
}

impl NotedError {
    fn code(&self) -> http::status::StatusCode {
        use http::status::StatusCode;
        use NotedError::*;

        match self {
            SerdeJson(_) => StatusCode::BAD_REQUEST,
            DieselResult(_) => StatusCode::BAD_REQUEST,
            R2D2(_) => StatusCode::SERVICE_UNAVAILABLE,
            NotFound(_) => StatusCode::NOT_FOUND,
            Hyper(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}

impl IntoHandlerError for NotedError {
    fn into_handler_error(self) -> HandlerError {
        use NotedError::*;

        let code = self.code();

        match self {
            SerdeJson(j) => j.into_handler_error(),
            DieselResult(d) => d.into_handler_error(),
            R2D2(r) => r.into_handler_error(),
            Hyper(h) => h.into_handler_error(),
            NotFound(s) => failure::format_err!("{}", s).compat().into_handler_error(),
        }
        .with_status(code)
    }
}

impl From<hyper::error::Error> for NotedError {
    fn from(e: hyper::error::Error) -> NotedError {
        NotedError::Hyper(e)
    }
}

impl From<serde_json::Error> for NotedError {
    fn from(e: serde_json::Error) -> NotedError {
        NotedError::SerdeJson(e)
    }
}

impl From<diesel::result::Error> for NotedError {
    fn from(e: diesel::result::Error) -> NotedError {
        NotedError::DieselResult(e)
    }
}

impl From<r2d2::Error> for NotedError {
    fn from(e: r2d2::Error) -> NotedError {
        NotedError::R2D2(e)
    }
}
