use iron::prelude::*;
use iron;
use models;
use handlers::APIHandler;
use middleware::DbInstance;

handler!(GetCards: Vec<models::Card>, |req: &mut Request, conn: DbInstance| {
    use schema::users::dsl;
    let id: i32 = req.params().find("id").and_then(|id| id.parse().ok()).unwrap_or(-1);
    dsl::users.find(id).get_result::<models::User>(&*conn).and_then(|u| u.cards(&*conn)).map_err(|e| IronError::new(e, "No user found"))
});

handler!(GetCard: models::Card, |req: &mut Request, conn:DbInstance| {
    use schema::cards::dsl;
    let params = req.params();
    let id = params.find("id").and_then(|id| id.parse().ok()).unwrap_or(-1);
    let card_id = params.find("card_id").unwrap_or("");

    dsl::cards.find((id, card_id)).get_result(&*conn).map_err(|e| IronError::new(e, "No user found"))
});
