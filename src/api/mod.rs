
use auth;
use iron::AfterMiddleware;
use iron::Chain;
use iron::headers::ContentLength;
use iron::prelude::*;
use iron::response::WriteBody;
use std::io;
use std::ops::Deref;

#[macro_use]
mod handler;
mod users;
mod cards;

pub fn routes() -> Chain {
    let mut chain = Chain::new(router! {
        user_profile: get "/q/profile" => users::Profile,
        list_cards: get "/q/cards" => cards::ListCards,
        show_card: get "/q/cards/:card_name" => cards::ShowCard,
        add_card: post "/q/cards" => cards::AddCard,

    });
    chain.link_before(auth::HasUser);
    chain.link_after(JsonifyError);
    chain
}

struct JsonErrorWriter {
    inner: Option<Box<WriteBody>>,
}
impl JsonErrorWriter {
    fn new(inner: Option<Box<WriteBody>>) -> JsonErrorWriter { JsonErrorWriter { inner } }
}

impl WriteBody for JsonErrorWriter {
    fn write_body(&mut self, res: &mut io::Write) -> io::Result<()> {
        write!(res, "{{\"error\":\"")?;
        res.flush()?;
        match self.inner {
            Some(ref mut write) => write.write_body(res)?,
            None => write!(res, "unknown error")?,
        }
        res.flush()?;
        write!(res, "\"}}")?;
        res.flush()?;

        Ok(())
    }
}

struct JsonifyError;
impl AfterMiddleware for JsonifyError {
    fn catch(&self, _: &mut Request, err: IronError) -> IronResult<Response> {
        let mut resp = err.response;

        let cl = resp.headers
                     .get::<ContentLength>()
                     .map(|i| i.deref().clone())
                     .unwrap_or(13);
        resp.headers.set(ContentLength(cl + 12));
        resp.body = Some(Box::new(JsonErrorWriter::new(resp.body)));
        Ok(resp)
    }
}
