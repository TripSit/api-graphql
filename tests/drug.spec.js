'use strict';

const { gql } = require('apollo-server');
const { uuidPattern } = require('./utils');
const createServer = require('../server');

describe('Query', () => {
  describe('drugs', () => {
    test('get shallow list of all drugs', async () => {
      const { data, errors } = await createServer().executeOperation({
        query: gql`
          query GetAllDrugs {
            drugs {
              id
              summary
              psychonautwikiSlug
              errowidExperiencesUrl
              createdAt
            }
          }
        `,
      });

      expect(errors).toBeUndefined();
      expect(data.drugs.length > 300).toBe(true);
    });

    test('resolves names', async () => {
      const { data, errors } = await createServer().executeOperation({
        query: gql`
          query GetAllDrugs {
            drugs {
              id
              names {
                id
                name
                type
                primary
                createdAt
              }
            }
          }
        `,
      });

      expect(errors).toBeUndefined();
      expect(data.drugs[0].names.length).toBe(1);
      expect(data.drugs[0].names[0].name).toBe('apvt');
      expect(data.drugs[0].names[1].name).toBe('α-PVT');
    });

    test('resolves drug variants', async () => {
      const { data, errors } = await createServer().executeOperation({
        query: gql`
            query GetAllDrugs {
              drugs {
                id
                variants {
                  id
                }
              }
            }
        `,
      });

      expect(errors).toBeUndefined();
      expect(data.drugs[0].variants.length).toBe(1);
    });

    test('resolves drug roas', async () => {
      const { data, errors } = await createServer().executeOperation({
        query: gql`
          query GetAllDrugs {
            drugs {
              variants {
                roas {
                  id
                  route
                }
              }
            }
          }
        `,
      });

      expect(errors).toBeUndefined();
      expect(data.drugs[0].variants[0].roas.length).toBe(3);
      expect(data.drugs[0].variants[0].roas[0].route).toEqual('ORAL');
    });
  });
});

describe('Mutation', () => {
  test('createDrug', async () => {
    const { data, errors } = await createServer().executeOperation({
      query: gql`
        mutation CreateDrug($drug: CreateDrugInput!) {
          createDrug(drug: $drug) {
            id
            displayName
            summary
            psychonautwikiSlug
            errowidExperiencesUrl
          }
        }
      `,
      variables: {
        drug: {
          name: 'zzz',
          summary: 'BOOM',
          psychonautwikiSlug: 'supah-mario',
          errowidExperiencesUrl: 'https://example.com/smoke',
        },
      },
    });

    expect(errors).toBeUndefined();
    expect(data.createDrug.id).toMatch(uuidPattern);

    const record = await db.knex('drugs').where('id', data.createDrug.id).first();
    expect(record).toEqual({});
  });
});
