'use strict';

const { gql } = require('apollo-server');

exports.typeDefs = gql`
  extend type Mutation {
    createRole($input: CreateRoleInput!): Role!
  }

  input CreateRoleInput {
    name: String!
    description: String
  }

  type Role {
    id: ID!
    name: String!
    description: String
    users: [User!]!
  }
`;

exports.resolvers = {
  Mutation: {
    async createRole(root, { input }, { dataSources }) {
      return dataSources.knex('roles')
        .insert(input)
        .returning('*')
        .then(([record]) => record);
    },
  },

  Role: {
    async users(role, params, { dataSources }) {
      return dataSources.knex('users')
        .innerJoin('userRoles', 'userRoles.userId', 'users.id')
        .where('userRoles.roleId', role.id)
        .select('*');
    },
  },
};
