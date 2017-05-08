use schema::cards;
use models::User;

#[derive(Identifiable, Queryable, Associations, Debug, Serialize)]
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

