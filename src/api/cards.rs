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
use noted_linker::LinkedDocument;
use params::{self, FromValue};
use cache::CacheExt;

#[derive(Serialize)]
pub struct Card {
    card: models::Card,
    doc:  String,
}

handler!(
    ListCards: Vec<models::Card>,
    |req: &mut Request, conn: DbInstance| { models::Card::for_user(req.current_user()?, &conn) }
);

handler!(
    ShowCard: Card,
    |req: &mut Request, conn: DbInstance| -> NResult<Card> {
        use schema::cards::dsl::{cards, permalink, title};

        let user_id: i64 = req.current_user()?.unwrap().id;
        let card_id = {
            let params = req.params();
            params.find("card_name").unwrap_or("")
        };

        {
            let mut cache = req.cache()?;
            cache.page_names = cards
                .select((title, permalink))
                .load(&*conn)?
                .into_iter()
                .collect();
            req.save_cache(cache);
        }

        let page_names = req.cache()?.page_names;

        let card: models::Card = cards
            .find((user_id, card_id))
            .get_result(&*conn)
            .map_err(|e| IronError::new(e, "No user found"))?;
        Ok(Card {
            doc: LinkedDocument::new(card.body.as_str(), page_names).get_html(),
            card,
        })
    }
);

handler!(
    AddCard: models::Card,
    |req: &mut Request, conn: DbInstance| -> NResult<models::Card> {
        use schema::cards;
        let user_id = req.current_user()?.unwrap().id;
        let params = req.get_ref::<params::Params>()
            .expect("Could not find params");
        let title = params
            .find(&["card", "title"])
            .and_then(String::from_value)
            .ok_or_else(|| {
                NotedError::Safe(SafeError::ValueRequiredError("card[title]".to_owned()))
            })?;
        let new_card = NewCard {
            user_id,
            permalink: &title
                .split_whitespace()
                .collect::<Vec<_>>()
                .join("-")
                .clone(),
            title: &title,
            body: &params
                .find(&["card", "body"])
                .and_then(String::from_value)
                .ok_or_else(|| {
                    NotedError::Safe(SafeError::ValueRequiredError("card[body]".to_owned()))
                })?,
        };
        println!("{:?}", new_card);

        Ok(diesel::insert(&new_card)
            .into(cards::table)
            .get_result(&*conn)?)
    }
);
