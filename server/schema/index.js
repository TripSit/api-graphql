'use strict';

const { gql } = require('apollo-server');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const scalarSchema = require('./scalar');
const userSchema = require('./user');
const userReportsSchema = require('./user-reports');
const discordAccountSchema = require('./discord-account');
const roleSchema = require('./role');
const userRoleSchema = require('./user-roles');

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
      discordAccountSchema.typeDefs,
      roleSchema.typeDefs,
      userRoleSchema.typeDefs,
    ],
    resolvers: {
      ...scalarSchema.resolvers,
      ...userSchema.resolvers,
      ...userReportsSchema.resolvers,
      ...discordAccountSchema.resolvers,
      ...roleSchema.resolvers,
      ...userRoleSchema.resolvers,
      Query: {
        ...userSchema.resolvers.Query,
        ...userReportsSchema.resolvers.Query,
        ...discordAccountSchema.resolvers.Query,
        ...roleSchema.resolvers.Query,
        ...userRoleSchema.resolvers.Query,
      },
      Mutation: {
        ...userSchema.resolvers.Mutation,
        ...userReportsSchema.resolvers.Mutation,
        ...discordAccountSchema.resolvers.Mutation,
        ...roleSchema.resolvers.Mutation,
        ...userRoleSchema.resolvers.Mutation,
      },
    },
  });
};
