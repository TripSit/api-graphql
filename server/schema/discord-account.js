'use strict';

const { gql } = require('apollo-server');
const discordAccountResolver = require('./resolvers/discord-account');

exports.typeDefs = gql`
  extend type Mutation {
    createDiscordAccount(discordAccountId: String!): DiscordAccount!
    updateDiscordAccount(discordAccountId: String!, updates: DiscordAccountUpdate!): DiscordAccount!
  }

  input DiscordAccountUpdate {
    userId: UUID
  }

  type DiscordAccount {
    id: ID!
    user: User
    isBot: Boolean!
    avatar: String
    username: String!
    joinedAt: DateTime!
    createdAt: DateTime!
  }
`;

exports.resolvers = {
  Mutation: {
    async createDiscordAccount(root, { discordAccountId }, { dataSources }) {
      return Promise.all([
        dataSources.discord.getUser({ id: discordAccountId }),
        dataSources.db.knex('discordAccounts')
          .insert({ id: discordAccountId })
          .returning('*')
          .then(([newDiscordAccount]) => newDiscordAccount),
      ])
        .then(([apiRes, dbRecord]) => discordAccountResolver(dbRecord, apiRes));
    },

    async updateDiscordAccount(root, { discordAccountId, updates }, { dataSources }) {
      return dataSources.db.transacting(async trx => {
        await trx('discordAccounts').updates(updates).where('id', discordAccountId);
        return trx('discordAccounts').where('id', discordAccountId);
      });
    },
  },

  DiscordAccount: {
    async user(discordAccount, params, { dataSources }) {
      return discordAccount.userId && dataSources.db.knex('users')
        .where('id', discordAccount.userId)
        .first();
    },
  },
};
