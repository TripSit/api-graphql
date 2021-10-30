'use strict';

const { ApolloServer } = require('apollo-server');
const responseCachePlugin = require('apollo-server-plugin-response-cache').default;
const dataSources = require('./data-sources');
const createSchema = require('./schema');
const { NODE_ENV } = require('../env');

module.exports = function createServer({ logger }) {
  return new ApolloServer({
    dataSources,
    connectToDevTools: NODE_ENV !== 'production',
    schema: createSchema(logger),
    plugins: [responseCachePlugin()],
    context() {
      return {
        logger,
      };
    },
  });
};
