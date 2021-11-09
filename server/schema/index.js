'use strict';

const { gql } = require('apollo-server');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const scalarSchema = require('./scalar');
const userSchema = require('./user');
const userNoteSchema = require('./user-note');
const discordAccountSchema = require('./discord-account');
const alertSchema = require('./alert');
const drugSchema = require('./drug');
const drugNameSchema = require('./drug-name');

const baseTypeDefs = gql`
  type Query {
    _empty: Void
  }

  type Mutation {
    _empty: Void
  }
`;

module.exports = function createSchema() {
  return makeExecutableSchema([
    scalarSchema,
    userSchema,
    userNoteSchema,
    discordAccountSchema,
    alertSchema,
    drugSchema,
    drugNameSchema,
  ]
    .reduce((acc, schema) => ({
      typeDefs: acc.typeDefs.concat(schema.typeDefs),
      resolvers: {
        ...acc.resolvers,
        ...schema.resolvers,
        Query: {
          ...acc.resolvers.Query,
          ...schema.resolvers.Query,
        },
        Mutation: {
          ...acc.resolvers.Mutation,
          ...schema.resolvers.Mutation,
        },
      },
    }), {
      typeDefs: [baseTypeDefs],
      resolvers: [],
    }));
};
