// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

use {
    crate::schema::notes,
    serde_derive::{Deserialize, Serialize},
};

#[derive(Queryable, Serialize)]
pub struct Note {
    pub id: i32,
    pub title: String,
    pub body: String,
}

#[derive(Insertable, Deserialize)]
#[table_name = "notes"]
pub struct NewNote {
    pub title: String,
    pub body: String,
}

#[derive(AsChangeset, Deserialize)]
#[table_name = "notes"]
pub struct UpdateNote {
    pub title: Option<String>,
    pub body: Option<String>,
}
