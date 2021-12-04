'use strict';

const express = require('express');
const helmet = require('helmet');
const createGraphQlEndpoint = require('./graphql');

module.exports = async function createServer(deps) {
  const { logger } = deps;
  const app = express();
  app.use(helmet());
  await createGraphQlEndpoint(app, deps);

  app.use((ex, req, res, next) => {
    logger.error(ex);
    if (res.headersSent) next(ex);
    else res.sendStatus(500);
  });

  return app;
};
