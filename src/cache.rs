// Copyright 2017 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

use iron_sessionstorage::SessionRequestExt;
use session::Cache;
use iron::prelude::*;

pub trait CacheExt {
    fn cache(&mut self) -> IronResult<Cache>;
    fn save_cache(&mut self, cache: Cache) -> IronResult<()>;
}

impl<'a, 'b> CacheExt for Request<'a, 'b> {
    fn cache(&mut self) -> IronResult<Cache> {
        if let Some(cache) = self.session().get::<Cache>()? {
            Ok(cache)
        } else {
            Ok(Default::default())
        }
    }

    fn save_cache(&mut self, cache: Cache) -> IronResult<()> {
        self.session().set::<Cache>(cache)
    }
}
