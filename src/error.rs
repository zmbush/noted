// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

use actix_web::{HttpResponse, ResponseError};
use http::status::StatusCode;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Serialize, Deserialize, JsonSchema, Debug, Default)]
#[schemars(deny_unknown_fields)]
pub struct DbErrorDetails {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub hint: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub table_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub column_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub constraint_name: Option<String>,
}

#[derive(Serialize, Deserialize, JsonSchema, Debug, Default)]
#[schemars(deny_unknown_fields)]
pub struct ErrorData {
    pub code: u16,
    pub message: String,
    pub details: String,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub db: Option<DbErrorDetails>,
}

#[derive(Error, Debug)]
pub enum NotedError {
    #[error("not authorized")]
    NotLoggedIn,

    #[error("Your email address or password were incorrect")]
    LoginFailed,

    #[error("Failed to parse json data: {0}")]
    SerdeJson(#[from] serde_json::Error),

    #[error(transparent)]
    DbError(#[from] noted_db::error::DbError),

    #[error("Encountered error from session: {0}")]
    SessionError(actix_web::Error),
}

impl ResponseError for NotedError {
    fn status_code(&self) -> StatusCode {
        use NotedError::*;

        match *self {
            NotLoggedIn | LoginFailed => StatusCode::UNAUTHORIZED,
            SessionError(_) => StatusCode::SERVICE_UNAVAILABLE,
            DbError(ref dbe) => dbe.status_code(),
            SerdeJson(_) => StatusCode::BAD_REQUEST,
        }
    }

    fn error_response(&self) -> actix_web::HttpResponse {
        use NotedError::*;

        let mut data = ErrorData {
            code: self.status_code().as_u16(),
            message: format!("{}", self),
            details: format!("{:?}", self),

            ..ErrorData::default()
        };

        if let DbError(noted_db::error::DbError::DatabaseError(_, ref details)) = *self {
            data.db = Some(DbErrorDetails {
                details: details.details().map(String::from),
                hint: details.hint().map(String::from),
                table_name: details.table_name().map(String::from),
                column_name: details.column_name().map(String::from),
                constraint_name: details.constraint_name().map(String::from),
            });
        }

        HttpResponse::build(self.status_code()).json(&data)
    }
}

#[cfg(test)]
mod test {
    use actix_http::{body::MessageBody, Error, Request};
    use actix_web::{
        dev::{Service, ServiceResponse},
        test, web, App,
    };

    use super::*;

    async fn get<S, B>(app: &mut S, p: &str) -> ErrorData
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
        assert_eq!(resp.message, "not authorized");

        let resp = get(&mut app, "/SerdeJson").await;
        assert_eq!(resp.code, 400);
        assert_eq!(
            resp.message,
            "Failed to parse json data: expected ident at line 1 column 2",
        );

        let resp = get(&mut app, "/SessionError").await;
        assert_eq!(resp.code, 503);
        assert_eq!(
            resp.message,
            "Encountered error from session: expected ident at line 1 column 2",
        );
    }
}
