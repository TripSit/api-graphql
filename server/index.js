'use strict';

const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);
const createRouter = require('./routes');
const createGraphQlEndpoint = require('./graphql');
const createDefaultErrorHandler = require('./middleware/default-error-handler');
const { SESSION_SECRET, SESSION_MAX_AGE, SESSION_SECURE } = require('../env');

module.exports = async function createServer(deps) {
  const { knex } = deps;

  const app = express();
  app.use(helmet());

  app.use(session({
    secret: SESSION_SECRET,
    store: new KnexSessionStore({ knex }),
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: SESSION_MAX_AGE,
      httpOnly: true,
      secure: SESSION_SECURE,
    },
  }));

  app.use('/api', createRouter(deps));
  await createGraphQlEndpoint(app, deps);

  app.use(createDefaultErrorHandler(deps));
  return app;
};
