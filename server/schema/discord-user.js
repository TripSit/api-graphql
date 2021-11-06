'use strict';

const { gql, ValidationError } = require('apollo-server');
const discordUserResolver = require('./resolvers/discord-user');

exports.typeDefs = gql`
  extend type Mutation {
    createDiscordUser(discordUserId: String!): DiscordUser!
    associateAccount(userId: UUID!, username: String!): Void
  }

  input UpdateDiscordUserInput {
    username: UUID
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

    async associateAccount(root, { userId, username }, { dataSources }) {
      const [apiRes, dbUser] = await Promise.all([
        dataSources.discord.getUser(username),
        dataSources.db.knex('users').where('id', userId).first(),
      ]);
      if (!apiRes) throw new ValidationError('Discord user does not exist.');
      if (!dbUser) throw new ValidationError('User does not exist in the database.');
      await dataSources.db.knex('discordUsers')
        .where('id', apiRes.id)
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
