'use strict';

const { gql, ValidationError } = require('apollo-server');
const discordUserResolver = require('./resolvers/discord-user');

exports.typeDefs = gql`
  extend type Mutation {
    createDiscordUser(discordUserId: String!): DiscordUser!
    associateDiscordAccount(userId: UUID!, username: String!): Void
    associateIrcAccount(discordUserId: UUID!, nick: String!): Void
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
        dataSources.discord.getUser({ id: discordUserId }),
        dataSources.db.knex('discordUsers')
          .insert({ id: discordUserId })
          .returning('*')
          .then(([newDiscordUser]) => newDiscordUser),
      ])
        .then(([apiRes, dbRecord]) => discordUserResolver(dbRecord, apiRes));
    },

    async associateIrcAccount(root, { discordUserId, nick }, { dataSources }) {
      const { id: userId } = await dataSources.db.knex('users')
        .select('id')
        .where('nick', nick)
        .first();

      await dataSources.db.knex('discordUsers')
        .where('id', discordUserId)
        .update('userId', userId);
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
