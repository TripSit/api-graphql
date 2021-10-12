'use strict';

const { gql } = require('apollo-server');

exports.typeDefs = gql`
  extend type Mutation {
    reportUser(reportedBy: UUID!, reportedTo: UUID!, report: CreateUserReport!): UserReport!
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
    async reportUser(root, { reportedBy, reportedTo, report }, { dataSources }) {
      dataSources.knex('userReports').insert({
        userId: reportedTo,
        reportedByUserId: reportedBy,
        ...report,
      });
    },
  },

  UserReport: {
    async user(userReport, params, { dataSources }) {
      return dataSources.knex('users').where('id', userReport.userId);
    },

    async reportedBy(userReport, params, { dataSources }) {
      return dataSources.knex('users').where('id', userReport.reportedByUserId);
    },
  },
};
