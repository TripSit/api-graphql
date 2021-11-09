'use strict';

const { gql } = require('apollo-server');

exports.typeDefs = gql`
  extend type Query {
    drugById(drugId: UUID!): Drug!
    drugsByName(drugName: String!): [Drug!]!
  }

  extend type Mutation {
    createDrug(drug: CreateDrugInput!): Drug!
    updateDrug(drugId: UUID!, updates: UpdateDrugInput!): Drug!
  }

  input CreateDrugInput {
    name: String!
    summary: String
    psychonautWikiSlug: String
    errowidExperiencesUrl: String
  }

  input UpdateDrugInput {
    summary: String
    psychonautWikiSlug: String
    errowidExperiencesUrl: String
  }

  type Drug {
    id: ID!
    names: [DrugName!]!
    summary: String
    psychonautwikiSlug: String
    errowidExperiencesUrl: String
    createdAt: DateTime!
  }
`;

exports.resolvers = {
  Query: {
    async drugById(root, { drugId }, { dataSources }) {
      return dataSources.db.knex('drugs')
        .where('id', drugId)
        .first();
    },

    async drugs(root, { drugName }, { dataSources }) {
      return dataSources.db.knex('drugNames')
        .innerJoin('drugs', 'drugs.id', 'drugNames.drugId')
        .select('drugs.*')
        .where(dataSources.db.knex.raw('LOWER("nick") = ?', drugName.toLowerCase()));
    },
  },

  Mutation: {
    async createDrug(root, { drug }, { dataSources }) {
      const { name, ...rest } = drug;
      return dataSources.db.knex.transacting(async trx => {
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
          .return('*')
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
        return trx('drugs').where('id', drugId).first();
      });
    },
  },

  Drug: {
    async names(drug, params, { dataSources }) {
      return dataSources.db.knex('drugNames')
        .where('drugId', drug.id)
        .orderBy('primary')
        .orderBy('name');
    },
  },
};
