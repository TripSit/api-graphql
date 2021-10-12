'use strict';

const { ApolloServer } = require('apollo-server');
const responseCachePlugin = require('apollo-server-plugin-response-cache').default;
const createSchema = require('./schema');
const { NODE_ENV } = require('../env');

module.exports = function createServer({ logger, knex }) {
  return new ApolloServer({
    connectToDevTools: NODE_ENV !== 'production',
    schema: createSchema(),
    plugins: [responseCachePlugin()],
    dataSources() {
      return { knex };
    },
    context() {
      return {
        logger,
      };
    },
  });
};
