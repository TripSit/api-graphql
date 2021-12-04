'use strict';

const createServer = require('./server');
const createLogger = require('./logger');

const logger = createLogger();

createServer({
  logger,
})
  .then(() => {
    logger.info('TripSit API running...');
  });
