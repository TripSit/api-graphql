'use strict';

const Knex = require('knex');
const knexConfig = require('./knexfile');
const createServer = require('./server');
const createLogger = require('./logger');

const logger = createLogger();

let knex;
try {
  knex = Knex(knexConfig);
} catch (ex) {
  console.error('Unable to connect to database.', ex);
  process.exit(1);
}

createServer({ logger, knex })
  .then(() => {
    logger.info('TripSit API running...');
  });
