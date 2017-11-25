use error::NResult;
use iron::prelude::*;
use middleware::DbInstance;
use models::User;
use schema::cards;

#[derive(Identifiable, Queryable, Associations, Debug, Serialize)]
#[belongs_to(User)]
pub struct Card {
    pub id:        i64,
    pub user_id:   i64,
    pub permalink: String,
    pub title:     String,
    pub body:      String,
}

impl Card {
    pub fn for_user(user: Option<User>, conn: &DbInstance) -> NResult<Vec<Card>> {
        Ok(user.map(|u| u.cards(&*conn))
            .unwrap_or_else(|| Ok(Vec::new()))
            .map_err(|e| IronError::new(e, "No cards for user"))?)
    }
}


#[derive(Insertable, Debug)]
#[table_name = "cards"]
pub struct NewCard<'a> {
    pub user_id:   i64,
    pub permalink: &'a str,
    pub title:     &'a str,
    pub body:      &'a str,
}
