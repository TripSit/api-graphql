'use strict';

const { gql } = require('apollo-server');

exports.typeDefs = gql`
  extend type Query {
    roles: [Role!]!
  }

  extend type Mutation {
    createRole(input: CreateRoleInput!): Role!
    removeRole(roleId: UUID!): Void
  }

  input CreateRoleInput {
    name: String!
    description: String
  }

  type Role {
    id: ID!
    name: String!
    slug: String!
    description: String
    users: [User!]!
  }
`;

exports.resolvers = {
  Query: {
    async roles(root, params, { dataSources }) {
      return dataSources.db.knex('roles').orderBy('name');
    },
  },

  Mutation: {
    async createRole(root, { input }, { dataSources }) {
      return dataSources.db.knex('roles')
        .insert(input)
        .returning('*')
        .then(([record]) => record);
    },

    async removeRole(root, { roleId }, { dataSources }) {
      await dataSources.db.knex('roles')
        .where('id', roleId)
        .del();
    },
  },

  Role: {
    slug(role) {
      return role.name.toLowerCase().replace(/\s+/g, '-');
    },

    async users(role, params, { dataSources }) {
      return dataSources.db.knex('users')
        .innerJoin('userRoles', 'userRoles.userId', 'users.id')
        .where('userRoles.roleId', role.id)
        .select('users.*', 'userRoles.createdAt');
    },
  },
};
