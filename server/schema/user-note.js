'use strict';

const { gql } = require('apollo-server');

exports.typeDefs = gql`
  extend type Mutation {
    createUserNote(note: CreateUserNote!): UserNote!
  }

  input CreateUserNote {
    reportedTo: UUID!
    reportedBy: UUID!
    type: UserNoteType!
    text: String
    expiresAt: DateTime
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
  Mutation: {
    async createUserNote(root, { note }, { dataSources }) {
      const { reportedTo, reportedBy, ...xs } = note;
      return dataSources.db.knex('userNotes')
        .insert({
          userId: reportedTo,
          createdBy: reportedBy,
          ...xs,
        })
        .returning('*')
        .then(([newNote]) => newNote);
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
