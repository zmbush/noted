use schema::{cards, users};
use diesel;
use diesel::prelude::*;
use diesel::pg::PgConnection;

#[derive(Identifiable, Queryable, Associations, Debug)]
#[has_many(cards)]
pub struct User {
    pub id: i32,
    pub name: String,
}

impl User {
    pub fn cards(&self, conn: &PgConnection) -> QueryResult<Vec<Card>> {
        Card::belonging_to(self).load::<Card>(conn)
    }

    pub fn find_or_create(named: &str, conn: &PgConnection) -> QueryResult<User> {
        use schema::users::dsl::*;

        match users.filter(name.eq(named)).first::<User>(conn) {
            Err(_) => diesel::insert(&NewUser { name: named })
                .into(users).get_result::<User>(conn),
            ok => ok
        }
    }
}

#[derive(Identifiable, Queryable, Associations, Debug)]
#[belongs_to(User)]
pub struct Card {
    pub id: i32,
    pub user_id: i32,
    pub title: String,
    pub modified_title: Option<String>,
    pub body: String,
}

#[derive(Insertable)]
#[table_name="cards"]
pub struct NewCard<'a> {
    pub user_id: i32,
    pub title: &'a str,
    pub body: &'a str,
}

#[derive(Insertable)]
#[table_name="users"]
pub struct NewUser<'a> {
    pub name: &'a str,
}
