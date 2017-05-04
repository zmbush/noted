use schema::{cards, users};
use diesel;
use diesel::prelude::*;
use diesel::pg::PgConnection;
use models::Card;

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

#[derive(Insertable)]
#[table_name="users"]
pub struct NewUser<'a> {
    pub name: &'a str,
}
