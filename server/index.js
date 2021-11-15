'use strict';

const { ApolloServer } = require('apollo-server');
const responseCachePlugin = require('apollo-server-plugin-response-cache').default;
const createSchema = require('./schema');
const dataSources = require('./data-sources');
const createLogger = require('../logger');
const { NODE_ENV } = require('../env');

module.exports = function createServer(logger = createLogger()) {
  return new ApolloServer({
    dataSources,
    connectToDevTools: NODE_ENV !== 'production',
    schema: createSchema(),
    plugins: [responseCachePlugin()],
    context() {
      return {
        logger,
      };
    },
  });
};
