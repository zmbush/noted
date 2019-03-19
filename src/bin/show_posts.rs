// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

use noted::models::*;
use diesel::prelude::*;

fn main() {
    use noted::schema::notes::dsl::*;

    let connection = noted::establish_connection();
    let results = notes.limit(5).load::<Note>(&connection).expect("Error loading posts");

    println!("Displaying {} posts", results.len());
    for post in results {
        println!("{}", post.title);
        println!("--------");
        println!("{}", post.body);
    }
}
