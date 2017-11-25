
use diesel;
use diesel::pg::PgConnection;
use diesel::prelude::*;
use models::Card;
use schema::{cards, users};

#[derive(Identifiable, Queryable, Associations, Debug, Serialize)]
#[has_many(cards)]
pub struct User {
    pub id:        i64,
    pub google_id: String,
    pub email:     String,
}

impl User {
    pub fn cards(&self, conn: &PgConnection) -> QueryResult<Vec<Card>> {
        Card::belonging_to(self).load::<Card>(conn)
    }

    pub fn find_or_create(google_id: &str, email: &str, conn: &PgConnection) -> QueryResult<User> {
        use schema::users::dsl;

        match dsl::users
            .filter(dsl::google_id.eq(google_id))
            .first::<User>(conn)
        {
            Err(_) => diesel::insert(&NewUser { google_id, email })
                .into(dsl::users)
                .get_result::<User>(conn),
            ok => ok,
        }
    }
}

#[derive(Insertable)]
#[table_name = "users"]
pub struct NewUser<'a> {
    pub google_id: &'a str,
    pub email:     &'a str,
}
