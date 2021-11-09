'use strict';

const { gql } = require('apollo-server');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const scalarSchema = require('./scalar');
const userSchema = require('./user');
const userNoteSchema = require('./user-note');
const discordAccountSchema = require('./discord-account');
const alertSchema = require('./alert');
const drugSchema = require('./drug');

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
      userNoteSchema.typeDefs,
      discordAccountSchema.typeDefs,
      alertSchema.typeDefs,
      drugSchema.typeDefs,
    ],
    resolvers: {
      ...scalarSchema.resolvers,
      ...userSchema.resolvers,
      ...userNoteSchema.resolvers,
      ...alertSchema.resolvers,
      ...discordAccountSchema.resolvers,
      ...drugSchema.resolvers,
      Query: {
        ...userSchema.resolvers.Query,
        ...userNoteSchema.resolvers.Query,
        ...alertSchema.resolvers.Query,
        ...discordAccountSchema.resolvers.Query,
        ...drugSchema.resolvers.Query,
      },
      Mutation: {
        ...userSchema.resolvers.Mutation,
        ...userNoteSchema.resolvers.Mutation,
        ...discordAccountSchema.resolvers,
        ...alertSchema.resolvers.Mutation,
        ...drugSchema.resolvers.Mutation,
      },
    },
  });
};
