use schema::cards;
use models::User;

#[derive(Identifiable, Queryable, Associations, Debug, Serialize)]
#[belongs_to(User)]
pub struct Card {
    pub id: i64,
    pub user_id: i64,
    pub permalink: String,
    pub title: Option<String>,
    pub body: String,
}

#[derive(Insertable)]
#[table_name="cards"]
pub struct NewCard<'a> {
    pub user_id: i64,
    pub permalink: &'a str,
    pub title: &'a str,
    pub body: &'a str,
}
