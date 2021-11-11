'use strict';

const { gql } = require('apollo-server');

exports.typeDefs = gql`
  extend type Mutation {
    createDrugRoa(drugVariantId: UUID!, route: DrugRouteType!): DrugRoa!
    updateDrugRoa(drugRoaId: UUID!, updates: UpdateDrugRoaInput!): DrugRoa!
    removeDrugRoa(drugRoaId: UUID!): Void
  }

  input UpdateDrugRoaInput {
    doseThreshold: UnsignedFloat
  }

  type DrugRoa {
    id: ID!
    variant: DrugVariant!
    route: DrugRouteType!

    doseThreshold: UnsignedFloat
    doseLight: UnsignedFloat
    doseCommon: UnsignedFloat
    doseStrong: UnsignedFloat
    doseHeavy: UnsignedFloat
    doseWarning: String

    durationTotalMin: UnsignedFloat
    durationTotalMax: UnsignedFloat
    durationOnsetMin: UnsignedFloat
    durationOnsetMax: UnsignedFloat
    durationComeupMin: UnsignedFloat
    durationComeupMax: UnsignedFloat
    durationPeakMin: UnsignedFloat
    durationPeakMax: UnsignedFloat
    durationOffsetMin: UnsignedFloat
    durationOffsetMax: UnsignedFloat
    durationAfterEffectsMin: UnsignedFloat
    durationAfterEffectsMax: UnsignedFloat

    createdAt: DateTime!
  }

  enum DrugRouteType {
    ORAL
    INSUFFLATED
    INHALED
    TOPICAL
    SUBLINGUAL
    BUCCAL
    RECTAL
    INTRAMUSCULAR
    INTRAVENOUS
    SUBCUTANIOUS
    TRANSDERMAL
  }
`;

exports.resolvers = {
  Mutation: {
    async createDrugRoa(root, params, { dataSources }) {
      return dataSources.db.knex('drugRoas')
        .insert(params)
        .returning('*')
        .then(([a]) => a);
    },

    async updateDrugRoa(root, { drugRoaId, updates }, { dataSources }) {
      return dataSources.db.knex.transacting(async trx => {
        await trx('drugRoas').where('id', drugRoaId).update(updates);
        return trx('drugRoas').where('id', drugRoaId).first();
      });
    },

    async removeDrugRoa(root, { drugRoaId }, { dataSources }) {
      return dataSources.db.knex('drugRoas').where('id', drugRoaId).del();
    },
  },

  DrugRoa: {
    async variant(roa, params, { dataSources }) {
      return dataSources.db.knex('drugs').where('id', roa.drugVariantId).first();
    },
  },
};
