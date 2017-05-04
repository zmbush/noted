#[macro_use] extern crate serde_derive;
#[macro_use] extern crate diesel_codegen;
#[macro_use] extern crate diesel;

extern crate serde_json;
extern crate ncurses;
extern crate dotenv;

mod schema;
mod models;
mod ui;

use diesel::prelude::*;
use diesel::pg::PgConnection;
use self::diesel::pg::upsert::*;
use dotenv::dotenv;
use std::env;

#[derive(Serialize, Deserialize, Debug)]
struct Note {
    id: i64,
    title: String,
    contents: String,
    subnotes: Vec<Note>
}

#[derive(Serialize, Deserialize, Debug)]
struct Notebook {
    name: String,
    notes: Vec<Note>
}

impl Notebook {
    fn new(name: &str) -> Notebook {
        Notebook {
            name: String::from(name),
            notes: vec![]
        }
    }
}


fn main() {
    dotenv().expect("Unable to handle dotenv");
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");


    let connection = PgConnection::establish(&database_url).expect("Unable to connect to db");

    use schema::users::dsl::*;
    use schema::cards::dsl::*;

    let user = models::User::find_or_create("Jupiter", &connection).expect("Unable to get user!");
    println!("GOT: {:?}", user);

    let new_card = models::NewCard {
        user_id: user.id,
        title: "Jeebus",
        body: "this works?",
    };
    diesel::insert(&new_card.on_conflict((user_id, title), do_update().set(modified_title.eq("NEW TITLE!")))).into(cards).execute(&connection).expect("NORP");
    println!("GOT CARDS: {:?}", user.cards(&connection));

    let mut nb = Notebook::new("main");
    let mut interface = ui::UI::new();
}
