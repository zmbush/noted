// Copyright 2017 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

// @flow

import Knex from 'knex';
import Bookshelf from 'bookshelf';
import dotenv from 'dotenv';

dotenv.config();

const knex = Knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
});

const bookshelf = Bookshelf(knex);
bookshelf.plugin('registry');

export default bookshelf;
