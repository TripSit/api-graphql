'use strict';

const { gql, ValidationError } = require('apollo-server');

exports.typeDefs = gql`
  extend type Mutation {
    createDrugName(drugId: UUID!, name: String!, primary: Boolean): DrugName!
    removeDrugName(drugNameId: UUID!): Void
  }

  type DrugName {
    id: ID!
    drug: Drug!
    name: String!
    type: DrugNameType!
    primary: Boolean!
    createdAt: DateTime!
  }

  enum DrugNameType {
    COMMON
    SUBSTITUTIVE
    SYSTEMATIC
  }
`;

exports.resolvers = {
  Mutation: {
    async createDrugName(root, { drugId, name, primary }, { dataSources }) {
      const existingNames = await dataSources.db.knex('drugNames').where('drugId', drugId);
      if (existingNames.some(a => a.name === name)) {
        throw new ValidationError('Name already exists');
      }

      return dataSources.db.knex.transacting(async trx => {
        if (primary) {
          const currentPrimary = existingNames.find(a => a.primary);
          if (currentPrimary) {
            await trx('drugNames').update('primary', false).where('id', currentPrimary.id);
          }
        }

        return trx('drugNames')
          .insert({ drugId, name, primary })
          .returning('*')
          .then(([a]) => a);
      });
    },

    async removeDrugName(root, { drugNameId }, { dataSources }) {
      await dataSources.db.knex('drugNames')
        .where('id', drugNameId)
        .del();
    },
  },

  DrugName: {
    async drug(drugName, params, { dataSources }) {
      return dataSources.db.knex('drugs').where('id', drugName.drugId).first();
    },
  },
};
