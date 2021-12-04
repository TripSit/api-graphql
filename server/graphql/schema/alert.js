'use strict';

const { gql } = require('apollo-server-core');

exports.typeDefs = gql`
  extend type Query {
    alerts(input: AlertSearchQuery!): [Alert!]!
  }

  input AlertSearchQuery {
    alertIds: [UUID]
    userIds: [UUID]
    type: [AlertType]
  }

  extend type Mutation {
    createAlert(userId: UUID!, type: AlertType!, text: String): [Alert!]!
  }

  type Alert {
    id: ID!
    requestingUser: User!
    type: AlertType!
    text: String
    createdAt: DateTime!
  }

  enum AlertType {
    TRIPSIT
    SANCTUARY
  }
`;

exports.resolvers = {
  Query: {
    async alerts(root, { alertIds, userIds, type }, { dataSources }) {
      const sqlQuery = dataSources.db.knex('alerts').orderBy('createdAt');
      if (alertIds) alertIds.reduce((acc, alertId) => acc.where('id', alertId), sqlQuery);
      if (userIds) userIds.reduce((acc, userId) => acc.where('requestingUserId', userId), sqlQuery);
      if (type) type.reduce((acc, a) => acc.where('type', a), sqlQuery);
      return sqlQuery.then(a => a || []);
    },
  },

  Mutation: {
    async createAlert(root, params, { dataSources }) {
      return dataSources.db.knex('alerts')
        .insert({
          requestingUser: params.userId,
          type: params.type,
          text: params.text,
        })
        .returning('*')
        .then(([newAlert]) => newAlert);
    },
  },

  Alert: {
    async requestingUser(alert, params, { dataSources }) {
      return dataSources.db.knex('users')
        .where('id', alert.userId)
        .first();
    },
  },
};
