'use strict';

const createServer = require('./server');
const createLogger = require('./logger');
const { HTTP_PORT } = require('./env');

const logger = createLogger();
const server = createServer({
  logger,
});

server.listen(HTTP_PORT).then(({ url }) => {
  logger.info(`TripSit API available at ${url}`);
});
