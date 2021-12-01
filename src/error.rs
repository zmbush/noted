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
            SessionError(actix_web::Error),
            $($native),*,
            $($type($inner)),*
        }

        impl NotedError {
            fn code(&self) -> http::status::StatusCode {
                use NotedError::*;

                match self {
                    DbError(_) => StatusCode::SERVICE_UNAVAILABLE,
                    SessionError(_) => StatusCode::SERVICE_UNAVAILABLE,
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
        NotLoggedIn => StatusCode::UNAUTHORIZED
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

#[cfg(test)]
mod test {
    use actix_http::{body::MessageBody, Error, Request};
    use actix_web::{
        dev::{Service, ServiceResponse},
        test, web, App,
    };
    use noted_db::error::ErrorDataOwned;

    use super::*;

    async fn get<S, B>(app: &mut S, p: &str) -> ErrorDataOwned
    where
        S: Service<Request = Request, Response = ServiceResponse<B>, Error = Error>,
        B: MessageBody + Unpin,
    {
        let req = test::TestRequest::with_uri(p).to_request();
        test::read_response_json(app, req).await
    }

    #[actix_rt::test]
    async fn test_http_response() {
        let mut app = test::init_service(
            App::new()
                .service(
                    web::resource("/NotLoggedIn")
                        .to(|| async { NotedError::NotLoggedIn.error_response().await }),
                )
                .service(web::resource("/SerdeJson").to(|| async {
                    NotedError::from(serde_json::from_str::<i32>("notnum").unwrap_err())
                        .error_response()
                        .await
                }))
                .service(web::resource("/SessionError").to(|| async {
                    NotedError::SessionError(Error::from(
                        serde_json::from_str::<i32>("notnum").unwrap_err(),
                    ))
                    .error_response()
                    .await
                })),
        )
        .await;

        let resp = get(&mut app, "/NotLoggedIn").await;
        assert_eq!(resp.code, 401);
        assert_eq!(resp.error, "NotLoggedIn");

        let resp = get(&mut app, "/SerdeJson").await;
        assert_eq!(resp.code, 400);
        assert_eq!(
            resp.error,
            r#"SerdeJson(Error("expected ident", line: 1, column: 2))"#
        );

        let resp = get(&mut app, "/SessionError").await;
        assert_eq!(resp.code, 503);
        assert_eq!(
            resp.error,
            r#"SessionError(Error("expected ident", line: 1, column: 2))"#
        );
    }
}
