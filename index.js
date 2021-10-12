'use strict';

const knex = require('knex');
const knexConfig = require('./knexfile');
const createServer = require('./server');
const createLogger = require('./logger');
const { HTTP_PORT } = require('./env');

const logger = createLogger();
const server = createServer({
  logger,
  knex: knex(knexConfig),
});

server.listen(HTTP_PORT).then(({ url }) => {
  logger.info(`TripSit API available at ${url}`);
});
