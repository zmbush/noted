// @flow

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import authentication from 'express-authentication';
import graphqlHTTP from 'express-graphql';
import { buildSchema } from 'graphql';
import session from 'express-session';
import Grant from 'grant-express';
import logger from 'morgan';
import ConnectRedis from 'connect-redis';

import request from 'request';
import Purest from 'purest';
import config from '@purest/providers';

const purest = Purest({ request, promise: Promise });
const google = purest({ provider: 'google', config });

import Knex from 'knex';
import Bookshelf from 'bookshelf';
const knex = Knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
});

const bookshelf = Bookshelf(knex);

var User = bookshelf.Model.extend({
  tableName: 'users',
});

const schema = buildSchema(`
  type Query {
    hello: String!
    bort: String!
  }
`);

const root = {
  hello: () => {
    return 'Hello world!';
  },
};

const grant = Grant({
  'server': {
    'protocol': 'http',
    'host': 'localhost:4000',
    'transport': 'session',
    'state': true,
    'callback': '/oauth',
  },
  'google': {
    'key': process.env.GOOGLE_OAUTH_CLIENT_ID,
    'secret': process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    'scope': ['openid', 'email', 'profile'],
  },
});

const RedisStore = ConnectRedis(session);

const app = express();
app.use(logger('dev'));
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.use(session({
  store: new RedisStore(),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
}));
app.use(grant);
app.use('/oauth', async (req, res, next) => {
  const [,body] = await google
    .query('plus')
    .get('people/me')
    .auth(req.session.grant.response.access_token)
    .request();

  let user;
  try {
    user = await User.where('provider_id', body.id).fetch({require: true});
  } catch (e) {
    user = new User({
      email: body.emails[0].value,
      provider_id: body.id,
      image_url: body.image.url,
      user_name: body.displayName,
    });
    user = await user.save();
  }

  req.session.provider_id = user.get('provider_id');
  req.session.user_id = user.get('id');
  res.end(JSON.stringify(req.session), null, 2);

  next();
});

app.use(async (req, res, next) => {
  req.challenge = req.session.userid;
  try {
    const user = await User.where('id', req.session.user_id).fetch({required: true});
    console.log("Got user");
    req.authenticated = true;
    req.authentication = user;
  } catch (e) {
    console.log("Got no user");
    req.authenticated = false;
    req.authentication = null;
  }

  next();
});
app.use('/', authentication.required(), (req, res) => {
  console.log(req.authentication);
  console.log("Cropping?", req);
  res.end(JSON.stringify(req.authentication));
});
app.use((err, req, res, next) => {
  console.log(err);
  res.end(JSON.stringify(err));
});
app.listen(4000);

console.log('Running a GraphQL API Server at localhost:4000');
