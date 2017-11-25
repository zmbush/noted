use auth;
use iron::AfterMiddleware;
use iron::Chain;
use iron::Error;
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
    error: Box<Error + Send>,
}
impl JsonErrorWriter {
    fn new(inner: Option<Box<WriteBody>>, error: Box<Error + Send>) -> JsonErrorWriter {
        JsonErrorWriter { inner, error }
    }
}

impl WriteBody for JsonErrorWriter {
    fn write_body(&mut self, res: &mut io::Write) -> io::Result<()> {
        write!(res, "{{\"type\":\"")?;
        res.flush()?;
        match self.inner {
            Some(ref mut write) => write.write_body(res)?,
            None => write!(res, "unknown")?,
        }
        res.flush()?;
        write!(res, "\",\"error\":\"{}", self.error)?;
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
            .map(|i| *i.deref())
            .unwrap_or(7);
        resp.headers.set(ContentLength(
            cl + 22 + format!("{}", err.error).len() as u64,
        ));
        resp.body = Some(Box::new(JsonErrorWriter::new(resp.body, err.error)));
        Ok(resp)
    }
}
