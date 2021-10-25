'use strict';

const { gql } = require('apollo-server');
const { query } = require('express');

exports.typeDefs = gql`
  extend type Mutation {
    updateUserRoles(userId: UUID!, userRoleIds: [UUID!]!): User!
  }

  type UserRole {
    id: ID!
    user: User!
    role: Role!
    createdAt: DateTime!
  }
`;

exports.resolvers = {
  Mutation: {
    async updateUserRoles(root, { userId, userRoleIds }, { dataSources }) {
      return dataSources.db.knex.transacting(async trx => {
        const prevUserRoleIds = await trx('userRoles')
          .where('userId', userId)
          .select('id');

        await Promise.all([
          userRoleIds
            .filter(userRoleId => !prevUserRoleIds.includes(userRoleId))
            .reduce(
              (sql, roleId) => sql.insert({ userId, roleId }),
              dataSources.db.knex('userRoles'),
            ),
          prevUserRoleIds
            .filter(userRoleId => query.where('userId', userRoleId))
            .reduce(
              (sql, roleId) => sql.where('roleId', roleId),
              dataSources.db.knex('userRoles'),
            ),
        ]);
      });
    },
  },

  UserRole: {
    async user(userRole, params, { dataSources }) {
      return dataSources.db.knex('users').where('id', userRole.userId).first();
    },

    async role(userRole, params, { dataSources }) {
      return dataSources.db.knex('roles').where('id', userRole.roleId).first();
    },
  },
};
