'use strict';

const { gql, AuthenticationError } = require('apollo-server');
const argon = require('argon2');
const discordAccountResolver = require('./resolvers/discord-account');

exports.typeDefs = gql`
  extend type Query {
    users(input: UserSearchInput): [User!]!
    authenticate(nick: String!, password: String!): User!
  }

  input UserSearchInput {
    id: UUID
    nick: String
  }

  extend type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(userId: UUID!, input: UpdateUserInput!): User!
  }

  input CreateUserInput {
    nick: String!
    password: String!
    email: EmailAddress
  }

  input UpdateUserInput {
    email: EmailAddress
    password: String
    accessLevel: UserAccessLevel
    alertTripsit: Boolean
    alertSanctuary: Boolean
  }

  type User {
    id: ID!
    nick: String!
    email: EmailAddress
    accessLevel: UserAccessLevel!
    alertTripsit: Boolean!
    alertSanctuary: Boolean!
    notes: [UserNote!]!
    discord: DiscordAccount
    createdAt: DateTime!
  }

  enum UserAccessLevel {
    ADMINISTRATOR
    MODERATOR
    TRIPSITTER
    USER
  }
`;

exports.resolvers = {
  Query: {
    async users(root, { input }, { dataSources }) {
      const sqlQuery = dataSources.db.knex('users');
      if (input?.id) sqlQuery.where('id', input.id);
      if (input?.nick) {
        sqlQuery.where(dataSources.db.knex.raw('LOWER("nick") = ?', input.nick.toLowerCase()));
      }
      if (input?.alertTripsit) sqlQuery.update('alertTripsit', input.alertTripsit);
      if (input?.alertSanctuary) sqlQuery.update('alertSanctuary', input.alertSanctuary);
      return sqlQuery;
    },

    async authenticate(root, { nick, password }, { dataSources }) {
      const { passwordHash, ...user } = await dataSources.db.knex('users')
        .where('nick', nick)
        .first();
      if (!(await argon.verify(passwordHash, password))) throw new AuthenticationError();
      return user;
    },
  },

  Mutation: {
    async createUser(root, { input }, { dataSources }) {
      return dataSources.db.knex('users')
        .insert({
          nick: input.nick,
          passwordHash: await argon.hash(input.password),
          email: input.email,
        })
        .returning('*')
        .then(([a]) => a);
    },

    async updateUser(root, { userId, input }, { dataSources }) {
      const dbQuery = dataSources.db.knex('users').where('id', userId);
      if (input.password) dbQuery.update('passwordHash', await argon.hash(input.password));
      if (input.email) dbQuery.update('email', input.email);
      if (input.accessLevel) dbQuery.update('accessLevel', input.accessLevel);
      if (input.alertTripsit) dbQuery.update('alertTripsit', input.alertTripsit);
      if (input.alertSanctuary) dbQuery.update('alertSanctuary', input.alertSanctuary);
      await dbQuery;
      return dataSources.db.knex('users').where('id', userId).first();
    },
  },

  User: {
    async notes(user, params, { dataSources }) {
      return dataSources.db.knex('userNotes')
        .where('userId', user.id)
        .where('isDeleted', false)
        .orderBy('createdAt');
    },

    async discord(user, params, { dataSources }) {
      const dbRecord = await dataSources.db.knex('discordAccounts')
        .where('userId', user.id)
        .first();
      if (!dbRecord) return null;
      const apiRes = await dataSources.discord.getUserById(dbRecord.id);
      return discordAccountResolver(dbRecord, apiRes);
    },
  },
};
