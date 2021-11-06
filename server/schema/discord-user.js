'use strict';

const { gql } = require('apollo-server');
const discordUserResolver = require('./resolvers/discord-user');

exports.typeDefs = gql`
  extend type Mutation {
    createDiscordUser(discordUserId: String!): DiscordUser!
    associateDiscordUser(userId: UUID!, discordUserId: String!): Void
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

    async associateDiscordUser(root, { userId, discordUserId }, { dataSources }) {
      const query = dataSources.db.knex('discordUsers')
        .innerJoin('users', 'users.id', 'discordUsers.userId')
        .select('discordUsers.*')
        .first();
      if (discordUserId) query.where('discordUsers.id', discordUserId);
      if (userId) query.where('users.id', userId);
      const discordUser = await query;
      return discordUser || null;
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
