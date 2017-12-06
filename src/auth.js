// Copyright 2017 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

// @flow

import session from 'express-session';
import ConnectRedis from 'connect-redis';
import Grant from 'grant-express';
import Purest from 'purest';
import config from '@purest/providers';
import request from 'request';
import dotenv from 'dotenv';
import type { $Request, $Application, $Response, NextFunction } from 'express';

import { asyncHandler } from 'src/util';
import User from 'src/models/User';
import Logger from 'src/logger';

const logger = Logger(module);

dotenv.config();

const RedisStore = ConnectRedis(session);
const purest = Purest({ request, promise: Promise });
const google = purest({ provider: 'google', config });

export type AuthenticatedRequest = $Request & {
  authenticated: bool,
  authentication: {},
};

type SessionRequest = $Request & {
  session: {
    destroy: () => void,
  },
};

export default function AuthMiddlewares(app: $Application) {
  app.use(session({
    store: new RedisStore(),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  }));

  const grant = Grant({
    server: {
      protocol: 'http',
      host: 'localhost:4000',
      transport: 'session',
      state: true,
      callback: '/oauth',
    },
    google: {
      key: process.env.GOOGLE_OAUTH_CLIENT_ID,
      secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      scope: ['openid', 'email', 'profile'],
    },
  });
  app.use(grant);

  app.use('/oauth', asyncHandler(async (req, res, next) => {
    logger.info('oauth');
    if (!req.session.grant || !req.session.grant.response) {
      logger.error('No session found for oauth endpoint');
      throw new Error('no session');
    }

    const [, body] = await google
      .query('plus')
      .get('people/me')
      .auth(req.session.grant.response.access_token)
      .request();
    logger.info('getting shit');

    if (body.error) {
      logger.info('got error...', body.error);
      throw body.error;
    }

    let user;
    try {
      logger.info('getting user');
      user = await User.where('provider_id', body.id).fetch({ require: true });
      if (!user) {
        throw new Error('no user');
      }
    } catch (err) {
      logger.info('Failed to get user', err);
      user = new User({
        email: body.emails[0].value,
        provider_id: body.id,
        image_url: body.image.url,
        user_name: body.displayName,
      });
      logger.info('saving storp', user);
      try {
        user = await user.save();
      } catch (e) {
        logger.info('failed to save user...', e);
      }
    }

    req.session.provider_id = user.get('provider_id');
    req.session.user_id = user.get('id');
    res.redirect('/');

    next();
  }));

  app.use('/logout', (req: SessionRequest, res: $Response, next: NextFunction) => {
    req.session.destroy();
    res.redirect('/');

    next();
  });

  app.use(asyncHandler(async (req, res, next) => {
    if (req.session.user_id) {
      logger.info('fetching user', { uid: req.session.user_id });
      req.challenge = req.session.user_id;
      try {
        const user = await User.where('id', req.session.user_id).fetch({ required: true });
        logger.info('user fetched', user);
        if (!user) {
          throw new Error('no user');
        }
        req.authenticated = true;
        req.authentication = await user
          .set('last_seen', new Date())
          .save();
        logger.info('Authentication successful!');
      } catch (e) {
        logger.info('Authentication failed...', { e: e.toString() });
        req.authenticated = false;
        req.authentication = { error: 'invalid user id' };
      }
    } else {
      logger.info('No user. Skipping auth');
    }

    next();
  }));
}
