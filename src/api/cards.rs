
use api::handler::APIHandler;
use auth::CurrentUserExt;
use diesel;
use diesel::prelude::*;
use error::{NResult, NotedError, SafeError};
use iron;
use iron::prelude::*;
use middleware::{DbInstance, RouterExt};
use models;
use models::NewCard;
use params::{self, FromValue};

handler!(ListCards: Vec<models::Card>, |req: &mut Request,
 conn: DbInstance| {
    use schema::users::dsl;
    let id: i64 = req.current_user()?.unwrap().id;
    dsl::users.find(id)
              .get_result::<models::User>(&*conn)
              .and_then(|u| u.cards(&*conn))
              .map_err(|e| IronError::new(e, "No user found"))
});

handler!(ShowCard: models::Card, |req: &mut Request,
 conn: DbInstance| {
    use schema::cards::dsl;
    let id: i64 = req.current_user()?.unwrap().id;
    let params = req.params();
    let card_id = params.find("card_name").unwrap_or("");

    dsl::cards.find((id, card_id))
              .get_result(&*conn)
              .map_err(|e| IronError::new(e, "No user found"))
});

handler!(AddCard: models::Card, |req: &mut Request,
 conn: DbInstance|
 -> NResult<models::Card> {
    use schema::cards;
    let user_id = req.current_user()?.unwrap().id;
    let params = req.get_ref::<params::Params>()
                    .expect("Could not find params");
    let title =
        params.find(&["card", "title"])
              .and_then(String::from_value)
              .ok_or(NotedError::Safe(SafeError::ValueRequiredError("card[title]".to_owned())))?;
    let new_card =
        NewCard {
            user_id,
            permalink: &title.split_whitespace()
                             .collect::<Vec<_>>()
                             .join("-")
                             .clone(),
            title: &title,
            body:
                &params.find(&["card", "body"])
                       .and_then(String::from_value)
                       .ok_or(NotedError::Safe(SafeError::ValueRequiredError("card[body]"
                                                                                 .to_owned())))?,
        };

    Ok(diesel::insert(&new_card)
           .into(cards::table)
           .get_result(&*conn)?)
});
