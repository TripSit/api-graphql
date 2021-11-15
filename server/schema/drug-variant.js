'use strict';

const { gql } = require('apollo-server');

exports.typeDefs = gql`
  extend type Mutation {
    createDrugVariant(input: CreateDrugVariantInput!): DrugVariant!
    updateDrugVariant(drugVariantId: UUID!, updates: UpdateDrugVariantInput!): DrugVariant!
    removeDrugVariant(drugVariantId: UUID!): Void
  }

  input CreateDrugVariantInput {
    drugId: UUID!
    name: String!
  }

  input UpdateDrugVariantInput {
    name: String

  }

  type DrugVariant {
    id: ID!
    drug: Drug!
    roas: [DrugRoa!]!
    name: String!
    waterSolubilityPercentage: UnsignedFloat
    lipidSolubilityPercentage: UnsignedFloat
    createdAt: DateTime!
  }
`;

exports.resolvers = {
  Mutation: {
    async createDrugVariant(root, { input }, { dataSources }) {
      return dataSources.db.knex('drugVariants')
        .insert(input)
        .returning('*')
        .then(([a]) => a);
    },

    async updateDrugVariant(root, { drugVariantId, updates }, { dataSources }) {
      return dataSources.db.knex.transacting(async trx => {
        await trx('drugVariants').update(updates).where('id', drugVariantId);
        return trx('drugVariants').where('id', drugVariantId).first();
      });
    },

    async removeDrugVariant(root, { drugVariantId }, { dataSources }) {
      return dataSources.db.knex('drugVariants').where('id', drugVariantId).del();
    },
  },

  DrugVariant: {
    async drug(variant, params, { dataSources }) {
      return dataSources.db.knex('drugs')
        .where('id', variant.drugId)
        .first();
    },

    async roas(variant, params, { dataSources }) {
      return dataSources.db.knex('drugRoas').where('drugVariantId', variant.id);
    },
  },
};
