'use strict';

const http = require('http');
const { ApolloServer } = require('apollo-server-express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const responseCachePlugin = require('apollo-server-plugin-response-cache').default;
const createSchema = require('./schema');
const dataSources = require('./data-sources');
const { NODE_ENV, HTTP_PORT } = require('../../env');

module.exports = async function createServer(app, deps) {
  const { logger } = deps;
  const httpServer = http.createServer(app);

  const apolloServer = new ApolloServer({
    dataSources: () => dataSources(deps),
    connectToDevTools: NODE_ENV !== 'production',
    schema: createSchema(),
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      responseCachePlugin(),
    ],
    context({ req }) {
      return {
        logger,
        session: req.session,
      };
    },
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  return new Promise(resolve => {
    httpServer.listen({ port: HTTP_PORT }, () => {
      resolve(apolloServer);
    });
  });
};
