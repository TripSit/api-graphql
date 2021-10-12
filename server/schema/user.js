'use strict';

const { gql, AuthenticationError } = require('apollo-server');
const argon = require('argon2');

exports.typeDefs = gql`
  extend type Query {
    user($input: UserSearchInput!): [User!]!
    authenticate($nick: String!, $password: String!): User!
  }

  input UserSearchInput {
    id: UUID
    nick: String
  }

  extend type Mutation {
    createUser($nick: String!, $password: String!, $email: String): User!
    updateUser($id: UUID!, $input: UpdateUserInput!): User!
  }

  type User {
    id: ID!
    nick: String!
    email: EmailAddress
    discordAccounts: [DiscordAccount!]!
    roles: [Role!]!
    createdAt: DateTime!
  }
`;

exports.resolvers = {
  Query: {
    async user(root, { input }, { dataSources }) {
      const dbQuery = dataSources.knex('users').select('id', 'nick', 'email', 'createdAt');
      if (input.id) dbQuery.where('id', input.id);
      if (input.nick) dbQuery.where('nick', input.nick);
      return dbQuery;
    },

    async authenticate(root, { nick, password }, { dataSources }) {
      const { passwordHash, ...user } = await dataSources.knex('users')
        .where('nick', nick)
        .first();
      if (!(await argon.verify(passwordHash, password))) throw new AuthenticationError();
      return user;
    },
  },

  Mutation: {
    async createUser(root, { password, ...input }, { dataSources }) {
      return dataSources.knex('users').insert({
        ...input,
        passwordHash: await argon.hash(password),
      });
    },

    async updateUser(root, { id, input }, { dataSources }) {
      await dataSources.knex('users').update(input).where('id', id);
      return dataSources.knex('users').where('id', id).first();
    },
  },

  User: {
    async discordAccounts(user, params, { dataSources }) {
      return dataSources.knex('discordAccounts')
        .select('id', 'createdAt')
        .innerJoin('users', 'users.id', 'discordAccounts.userId')
        .where('users.id', user.id);
    },

    async roles(user, params, { dataSources }) {
      return dataSources.knex('roles')
        .innerJoin('userRoles', 'userRoles.roleId', 'roles.id')
        .where('userRoles.userId', user.id)
        .select('roles.*');
    },
  },
};
