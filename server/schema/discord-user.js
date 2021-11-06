'use strict';

const { gql } = require('apollo-server');
const discordUserResolver = require('./resolvers/discord-user');

exports.typeDefs = gql`
  extend type Mutation {
    createDiscordUser(discordUserId: String!): DiscordUser!
    updateDiscordUser(discordUserId: String!, input: UpdateDiscordUserInput!): DiscordUser!
  }

  input UpdateDiscordUserInput {
    userId: UUID
  }

  type DiscordUser {
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
    async createDiscordUser(root, { discordUserId }, { dataSources }) {
      return Promise.all([
        dataSources.discord.getUserById(discordUserId),
        dataSources.db.knex('discordUsers')
          .insert({ id: discordUserId })
          .returning('*')
          .then(([newDiscordUser]) => newDiscordUser),
      ])
        .then(([apiRes, dbRecord]) => discordUserResolver(dbRecord, apiRes));
    },

    async updateDiscordUser(root, { discordUserId, input }, { dataSources }) {
      return Promise.all([
        dataSources.discord.getUserById(discordUserId),
        dataSources.db.knex.transacting(async trx => {
          const updateQuery = trx('discordUsers').where('id', discordUserId);
          if (input.userId) updateQuery.update('userId', input.userId);
          await updateQuery;
          return trx('discordUsers').where('id', discordUserId).first();
        }),
      ])
        .then(([apiRes, dbRecord]) => discordUserResolver(dbRecord, apiRes));
    },
  },

  DiscordUser: {
    async user(discordUser, params, { dataSources }) {
      return discordUser.userId && dataSources.db.knex('users')
        .where('id', discordUser.userId)
        .first();
    },
  },
};
