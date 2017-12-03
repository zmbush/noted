// Copyright 2017 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

// @flow

import 'babel-polyfill';

import path from 'path';
import dotenv from 'dotenv';

import express from 'express';
import type { $Request, $Response, NextFunction } from 'express';
import morgan from 'morgan';

import GraphQL from 'src/graphql';
import AuthMiddlewares, { type AuthenticatedRequest } from 'src/auth';
import Logger from 'src/logger';

const logger = Logger(module);

dotenv.config();

const app = express();

app.set('view engine', 'pug');
app.set('views', './static');

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '../static')));

AuthMiddlewares(app);

app.use('/graphql', GraphQL);

app.get('/*', (req: AuthenticatedRequest, res: $Response, next: NextFunction) => {
  res.render('index', { user: JSON.stringify(req.authentication || {}) });
  next();
});

app.use((err: Error, req: $Request, res: $Response, next: NextFunction) => {
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
