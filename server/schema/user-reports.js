'use strict';

const { gql } = require('apollo-server');

exports.typeDefs = gql`
  extend type Mutation {
    reportUser(report: CreateUserReport!): UserReport!
  }

  input CreateUserReport {
    reportedTo: UUID!
    reportedBy: UUID!
    type: UserReportType!
    note: String
    expiresAt: DateTime
  }

  type UserReport {
    id: ID!
    user: User!
    reportedBy: User!
    type: UserReportType!
    expiresAt: DateTime
    createdAt: DateTime!
  }

  enum UserReportType {
    REPORT
    NOTE
    QUIET
    BAN
  }
`;

exports.resolvers = {
  Mutation: {
    async reportUser(root, { report }, { dataSources }) {
      const { reportedTo, reportedBy, ...xs } = report;
      dataSources.db.knex('userReports').insert({
        userId: reportedTo,
        reportedByUserId: reportedBy,
        ...xs,
      });
    },
  },

  UserReport: {
    async user(userReport, params, { dataSources }) {
      return dataSources.db.knex('users').where('id', userReport.userId);
    },

    async reportedBy(userReport, params, { dataSources }) {
      return dataSources.db.knex('users').where('id', userReport.reportedByUserId);
    },
  },
};
