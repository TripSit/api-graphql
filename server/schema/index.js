'use strict';

const { gql } = require('apollo-server');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const scalarSchema = require('./scalar');
const userSchema = require('./user');
const userReportsSchema = require('./user-reports');

const baseTypeDefs = gql`
  type Query {
    _empty: Void
  }

  type Mutation {
    _empty: Void
  }
`;

module.exports = function createSchema() {
  return makeExecutableSchema({
    typeDefs: [
      baseTypeDefs,
      scalarSchema.typeDefs,
      userSchema.typeDefs,
      userReportsSchema.typeDefs,
    ],
    resolvers: {
      ...scalarSchema.resolvers,
      ...userSchema.resolvers,
      ...userReportsSchema.resolvers,
      Query: {
        ...userSchema.resolvers.Query,
        ...userReportsSchema.resolvers.Query,
      },
      Mutation: {
        ...userSchema.resolvers.Mutation,
        ...userReportsSchema.resolvers.Mutation,
      },
    },
  });
};
