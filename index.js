'use strict';

const Knex = require('knex');
const knexConfig = require('./knexfile');
const createServer = require('./server');
const createLogger = require('./logger');

const logger = createLogger();

createServer({
  logger,
  knex: Knex(knexConfig),
})
  .then(() => {
    logger.info('TripSit API running...');
  });
