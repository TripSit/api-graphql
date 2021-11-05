'use strict';

const { gql } = require('apollo-server');
const { knex } = require('./utils');
const createLogger = require('../logger');
const createServer = require('../server');

beforeAll(async () => {})

describe('Mutations', () => {
  describe('createUser', () => {
    test('Can create a user', async () => {
      const server = createServer({
        knex,
        logger: createLogger(),
      });
      const { data, errors } = await server.executeOperation({
        query: gql`
          mutation CreateUser($nick: String!, $password: String!) {
            createUser(nick: $nick, password: $password) {
              id
              nick
              email
              createdAt
            }
          }
        `,
        variables: {
          nick: 'SevenCats',
          password: 'P@ssw0rd',
        },
      });

      expect(errors).toBeUndefined();
      expect(data.id).not.toBeNull();
      expect(data.nick).toBe('SevenCats');
      expect(data.email).toBeNull();
      expect(data.createdAt).not.toBeNull();
    });
  });
});
