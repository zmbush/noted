use schema::{cards, users};
use diesel;
use diesel::prelude::*;
use diesel::pg::PgConnection;

mod user;
mod card;

pub use self::user::{User, NewUser};
pub use self::card::{Card, NewCard};

