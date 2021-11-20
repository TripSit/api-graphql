'use strict';

const { gql } = require('apollo-server');

exports.typeDefs = gql`
  extend type Query {
    drugs: [Drug!]!
  }

  extend type Mutation {
    createDrug(drug: CreateDrugInput!): Drug!
    updateDrug(drugId: UUID!, updates: UpdateDrugInput!): Drug!
    removeDrug(drugId: UUID!): Void
  }

  input CreateDrugInput {
    name: String!
    summary: String
    psychonautwikiSlug: String
    erowidExperiencesUrl: String
  }

  input UpdateDrugInput {
    summary: String
    psychonautwikiSlug: String
    errowidExperiencesUrl: String
  }

  type Drug {
    id: ID!
    displayName: String!
    names: [DrugName!]!
    variants: [DrugVariant!]!
    summary: String
    psychonautwikiSlug: String
    errowidExperiencesUrl: String
    createdBy: User!
    createdAt: DateTime!
  }

  enum PsychoactiveDrugClass {
    PSYCHEDELIC
    STIMULANT
    EMPATHOGEN
    DEPRESSANT
    DISSOCIATIVE
  }
`;

exports.resolvers = {
  Query: {
    async drugs(root, params, { dataSources }) {
      return dataSources.db.knex('drugs').where('deleted', false);
    },
  },

  Mutation: {
    async createDrug(root, { drug }, { dataSources }) {
      const { name, ...rest } = drug;
      return dataSources.db.knex.transaction(async trx => {
        const newDrug = await trx('drugs')
          .insert(rest)
          .returning('*')
          .then(([a]) => a);

        const drugName = await trx('drugNames')
          .insert({
            name,
            drugId: newDrug.id,
            primary: true,
          })
          .returning('*')
          .then(([a]) => a);

        return {
          ...newDrug,
          names: [drugName],
        };
      });
    },

    async updateDrug(root, { drugId, updates }, { dataSources }) {
      return dataSources.db.knex.transacting(async trx => {
        await trx('drugs').where('id', drugId).updates(updates);
        return trx('drugs')
          .where('id', drugId)
          .where('deleted', false)
          .first();
      });
    },

    async removeDrug(root, { drugId }, { dataSources }) {
      return dataSources.db.knex('drugs')
        .where('id', drugId)
        .updates('deleted', true);
    },
  },

  Drug: {
    async displayName(drug, params, { dataSources }) {
      return dataSources.db.knex('drugNames')
        .select('name')
        .where('drugId', drug.id)
        .where('primary', true)
        .first()
        .then(({ name }) => name);
    },

    async names(drug, params, { dataSources }) {
      return dataSources.db.knex('drugNames')
        .where('drugId', drug.id)
        .orderBy('primary')
        .orderBy('name');
    },

    async variants(drug, params, { dataSources }) {
      return dataSources.db.knex('drugVariants').where('drugId', drug.id);
    },

    async createdBy(drug, params, { dataSources }) {
      return dataSources.db.knex('users').where('id', drug.createdBy).first();
    },
  },
};
