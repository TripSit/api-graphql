'use strict';

const { gql } = require('apollo-server');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const scalarSchema = require('./scalar');
const userSchema = require('./user');
const discordAccountSchema = require('./discord-account');
const roleSchema = require('./role');

const baseTypeDefs = gql`
  type Query {
    _empty: Void
  }

  type Mutation {
    _empty: Void
  }

  directive @cacheControl(
    maxAge: Int
    scope: CacheControlScope
  ) on FIELD_DEFINITION | OBJECT | INTERFACE

  enum CacheControlScope {
    PUBLIC
    PRIVATE
  }
`;

module.exports = function createSchema() {
  return makeExecutableSchema({
    typeDefs: [
      baseTypeDefs,
      scalarSchema.typeDefs,
      userSchema.typeDefs,
      discordAccountSchema.typeDefs,
      roleSchema.typeDefs,
    ],
    resolvers: {
      ...scalarSchema.resolvers,
      ...userSchema.resolvers,
      ...discordAccountSchema.resolvers,
      ...roleSchema.resolvers,
      Query: {
        ...userSchema.resolvers.Query,
        ...discordAccountSchema.resolvers.Query,
        ...roleSchema.resolvers.Query,
      },
      Mutation: {
        ...userSchema.resolvers.Mutation,
        ...discordAccountSchema.resolvers.Mutation,
        ...roleSchema.resolvers.Mutation,
      },
    },
  });
};
