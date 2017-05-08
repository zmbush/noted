use router::Router;

#[macro_use] mod handler;
mod users;

pub fn routes() -> Router {
    router! {
        list_users: get "/users" => users::GetUsers,
        show_user: get "/users/:id" => users::GetUser
    }
}
