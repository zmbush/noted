// @flow

import 'babel-polyfill';

import path from 'path';
import dotenv from 'dotenv';

import express from 'express';
import authentication from 'express-authentication';
import morgan from 'morgan';

import GraphQL from '~/src/graphql';
import AuthMiddlewares from '~/src/auth';
import logger from '~/src/logger';

dotenv.config();

const app = express();

app.set('view engine', 'pug');
app.set('views', './static');

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '../static')));

AuthMiddlewares(app);

app.use('/graphql', authentication.required(), GraphQL);

app.get('/*', (req, res) => {
  res.render('index', { user: JSON.stringify(req.authentication) });
});

app.use((err, req, res, next) => {
  if (err instanceof Error) {
    logger.error(err.toString());
    logger.error(err.stack);
  } else {
    logger.error('Failed to authenticatio: ', err);
  }
  if (err instanceof Error) {
    res.end(JSON.stringify({
      error: err.toString(),
      stack: err.stack,
    }));
  } else {
    res.end(JSON.stringify(err));
  }
  next();
});

app.listen(4000);
