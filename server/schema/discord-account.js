'use strict';

const { gql } = require('apollo-server');

exports.typeDefs = gql`
  extend type Query {
    discordAccount(id: String!): DiscordAccount!
  }

  extend type Mutation {
    createDiscordAccount(id: String!): Void
  }

  type DiscordAccount {
    id: ID!
    user: User
    createdAt: DateTime!
  }
`;

exports.resolvers = {
  Query: {
    async discordAccount(root, { id }, { dataSources }) {
      return dataSources.db.knex('discordAccounts')
        .where('id', id)
        .first();
    },
  },

  Mutation: {
    async createDiscordAccount(root, { id }, { dataSources }) {
      await dataSources.db.knex('discordAccounts').insert({ id });
    },
  },

  DiscordAccount: {
    async user(discordAccount, params, { dataSources }) {
      return !discordAccount.userId ? null : dataSources.db.knex('users')
        .where('id', discordAccount.userId)
        .first();
    },
  },
};
