'use strict';

const { gql } = require('apollo-server');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const scalarSchema = require('./scalar');
const userSchema = require('./user');
const userNoteSchema = require('./user-note');
const discordUserSchema = require('./discord-user');
const alertSchema = require('./alert');

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
      discordUserSchema.typeDefs,
      alertSchema.typeDefs,
    ],
    resolvers: {
      ...scalarSchema.resolvers,
      ...userSchema.resolvers,
      ...userNoteSchema.resolvers,
      ...discordUserSchema.resolvers,
      ...alertSchema.resolvers,
      Query: {
        ...userSchema.resolvers.Query,
        ...userNoteSchema.resolvers.Query,
        ...discordUserSchema.resolvers.Query,
        ...alertSchema.resolvers.Query,
      },
      Mutation: {
        ...userSchema.resolvers.Mutation,
        ...userNoteSchema.resolvers.Mutation,
        ...discordUserSchema.resolvers.Mutation,
        ...alertSchema.resolvers.Mutation,
      },
    },
  });
};
