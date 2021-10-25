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
  }

  type User {
    id: ID!
    nick: String!
    email: EmailAddress
    discordAccounts: [DiscordAccount!]!
    roles: [UserRole!]!
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

    async updateUserRoles(root, { userId, roleIds }, { dataSources }) {
      return dataSources.db.knex.transacting(async trx => {
        const currentUserRoleIds = await trx('userRoles')
          .where('userId', userId)
          .select('id');

        await Promise.all([
          roleIds
            .filter(roleId => !currentUserRoleIds.includes(roleId))
            .reduce(
              (query, roleId) => query.insert({ userId, roleId }),
              dataSources.db.knex('userRoles'),
            ),
          currentUserRoleIds
            .filter(roleId => !roleIds.includes(roleId))
            .reduce(
              (query, roleId) => query.where('roleId', roleId),
              dataSources.db.knex('userRoles').del(),
            ),
        ]);

        return dataSources.db.knex('userRoles').where('userId', userId);
      });
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

  UserRole: {
    async user(userRole, params, { dataSources }) {
      return dataSources.db.knex('users').where('id', userRole.userId).first();
    },

    async role(userRole, params, { dataSources }) {
      return dataSources.db.knex('roles').where('id', userRole.roleId).first();
    },
  },
};
