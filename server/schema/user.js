'use strict';

const { gql, AuthenticationError } = require('apollo-server');
const argon = require('argon2');

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
    updateUser(id: UUID!, input: UpdateUserInput!): User!
  }

  input CreateUserInput {
    nick: String!
    password: String!
    email: EmailAddress
  }

  input UpdateUserInput {
    email: EmailAddress
    password: String
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
    async users(root, { input }, { dataSources }) {
      const dbQuery = dataSources.db.knex('users').select('id', 'nick', 'email', 'createdAt');
      if (input?.id) dbQuery.where('id', input.id);
      if (input?.nick) {
        dbQuery.where(dataSources.db.knex.raw('LOWER("nick") = ?', input.nick.toLowerCase()));
      }
      return dbQuery;
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

    async updateUser(root, { id, input }, { dataSources }) {
      const dbQuery = dataSources.db.knex('users').where('id', id);
      if (input.password) dbQuery.update('passwordHash', await argon.hash(input.password));
      if (input.email) dbQuery.update('email', input.email);
      return dataSources.db.knex('users').where('id', id).first();
    },
  },

  User: {
    async discordAccounts(user, params, { dataSources }) {
      return dataSources.db.knex('discordAccounts')
        .select('id', 'createdAt')
        .innerJoin('users', 'users.id', 'discordAccounts.userId')
        .where('users.id', user.id);
    },

    async roles(user, params, { dataSources }) {
      return dataSources.db.knex('roles')
        .innerJoin('userRoles', 'userRoles.roleId', 'roles.id')
        .where('userRoles.userId', user.id)
        .select('roles.*');
    },
  },
};
