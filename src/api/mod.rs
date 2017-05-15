use router::Router;

#[macro_use]
mod handler;
mod users;
mod cards;

pub fn routes() -> Router {
    router! {
        list_users: get "/q/users" => users::GetUsers,
        show_user: get "/q/users/:id" => users::GetUser,
        list_cards: get "/q/cards/:user_id" => cards::GetCards,
        show_card: get "/q/cards/:user_id/:card_name" => cards::GetCard
    }
}
