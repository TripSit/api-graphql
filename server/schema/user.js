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
    createUserNote(note: CreateUserNote!): UserNote!
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
  }

  input CreateUserNote {
    reportedTo: UUID!
    reportedBy: UUID!
    type: UserNoteType!
    note: String
    expiresAt: DateTime
  }

  type User {
    id: ID!
    nick: String!
    email: EmailAddress
    accessLevel: UserAccessLevel!
    notes: [UserNote!]!
    createdAt: DateTime!
  }

  enum UserAccessLevel {
    ADMINISTRATOR
    MODERATOR
    TRIPSITTER
    USER
  }

  type UserNote {
    id: ID!
    user: User!
    type: UserNoteType!
    text: String
    reportedBy: User!
    expiresAt: DateTime
    createdAt: DateTime!
  }

  enum UserNoteType {
    REPORT
    NOTE
    QUIET
    BAN
  }
`;

exports.resolvers = {
  Query: {
    async users(root, { input }, { dataSources }) {
      const dbQuery = dataSources.db.knex('users');
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

    async updateUser(root, { userId, input }, { dataSources }) {
      const dbQuery = dataSources.db.knex('users').where('id', userId);
      if (input.password) dbQuery.update('passwordHash', await argon.hash(input.password));
      if (input.email) dbQuery.update('email', input.email);
      if (input.accessLevel) dbQuery.update('accessLevel', input.accessLevel);
      await dbQuery;
      return dataSources.db.knex('users').where('id', userId).first();
    },

    async createUserNote(root, { report }, { dataSources }) {
      const { reportedTo, reportedBy, ...xs } = report;
      dataSources.db.knex('userNotes').insert({
        userId: reportedTo,
        reportedByUserId: reportedBy,
        ...xs,
      });
    },
  },

  User: {
    async notes(user, params, { dataSources }) {
      return dataSources.db.knex('userNotes')
        .where('userId', user.id)
        .where('isDeleted', false)
        .orderBy('createdAt');
    },
  },

  UserNote: {
    async user(note, params, { dataSources }) {
      return dataSources.db.knex('users')
        .where('id', note.userId)
        .first();
    },

    async reportedBy(note, params, { dataSources }) {
      return dataSources.db.knex('users')
        .where('id', note.createdBy)
        .first();
    },
  },
};
