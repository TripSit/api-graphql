'use strict';

const { gql } = require('apollo-server');
const argon = require('argon2');

exports.typeDefs = gql`
  extend type Query {
    user($input: UserSearchInput!): [User!]!
  }

  input UserSearchInput {
    id: UUID
    nick: String
  }

  extend type Mutation {
    createUser($nick: String!, $password: String!): User!
  }

  type User {
    id: ID!
    nick: String!
    createdAt: DateTime!
  }
`;

exports.resolvers = {
  Query: {
    async user(root, { input }, { dataSources }) {
      const dbQuery = dataSources.knex('users').select('id', 'nick', 'createdAt');
      if (input.id) dbQuery.where('id', input.id);
      if (input.nick) dbQuery.where('nick', input.nick);
      return dbQuery;
    },
  },

  Mutation: {
    async createUser(root, { nick, password }, { dataSources }) {
      return dataSources.knex('users').insert({
        nick,
        password: await argon.hash(password),
      });
    },
  },
};
