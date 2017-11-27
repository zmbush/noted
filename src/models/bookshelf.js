import Knex from 'knex';
import Bookshelf from 'bookshelf';
import dotenv from 'dotenv';
import logger from '~/src/logger';

dotenv.config();

logger.info('Connecting to db:', { DATABASE_URL: process.env.DATABASE_URL });

const knex = Knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
});

const bookshelf = Bookshelf(knex);

export default bookshelf;
