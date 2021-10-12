'use strict';

const { gql } = require('apollo-server');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const scalarSchema = require('./scalar');

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
    typeDefs: [baseTypeDefs, scalarSchema.typeDefs],
    resolvers: {
      ...scalarSchema.resolvers,
      Query: {},
      Mutation: {},
    },
  });
};
