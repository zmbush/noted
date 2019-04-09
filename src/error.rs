// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

use {
    gotham::handler::{HandlerError, IntoHandlerError},
    http::status::StatusCode,
};

macro_rules! impl_noted_error {
    (native { $($native:ident => $native_code:path),* } $($type:ident => ($inner:ty, $code:path)),*) => {
        pub enum NotedError {
            $($native),*,
            $($type($inner)),*
        }

        impl NotedError {
            fn code(&self) -> http::status::StatusCode {
                use NotedError::*;

                match self {
                    $($native => $native_code),*,
                    $($type(_) => $code),*
                }
            }
        }

        impl IntoHandlerError for NotedError {
            fn into_handler_error(self) -> HandlerError {
                use NotedError::*;

                let code = self.code();

                match self {
                    $($native => failure::format_err!(stringify!($native)).compat().into_handler_error()),*,
                    $($type(e) => e.into_handler_error()),*
                }
                .with_status(code)
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
    }
    SerdeJson => (serde_json::Error, StatusCode::BAD_REQUEST),
    DieselResult => (diesel::result::Error, StatusCode::BAD_REQUEST),
    R2D2 => (r2d2::Error, StatusCode::SERVICE_UNAVAILABLE),
    NotFound => (failure::Compat<failure::Error>, StatusCode::NOT_FOUND),
    Hyper => (hyper::error::Error, StatusCode::INTERNAL_SERVER_ERROR),
    HTTP => (http::Error, StatusCode::INTERNAL_SERVER_ERROR),

    IO => (std::io::Error, StatusCode::SERVICE_UNAVAILABLE),
}
