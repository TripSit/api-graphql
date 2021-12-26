'use strict';

const path = require('path');
if (!process.env.POSTGRES_DATABASE) require('dotenv').config({ path: path.resolve('.env.test') });
const Knex = require('knex');
const sql = require('fake-tag');
const knexConfig = require('../knexfile');
const { POSTGRES_DATABASE } = require('../env');

module.exports = async function globalTeardown() {
  const knex = Knex(knexConfig);
  try {
    await knex.raw(sql`DROP DATABASE IF EXISTS ${POSTGRES_DATABASE}`);
  } finally {
    await knex.destroy();
  }
};
