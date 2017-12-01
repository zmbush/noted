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
