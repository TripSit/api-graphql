'use strict';

require('regenerator-runtime/runtime');
const path = require('path');
require('dotenv').config({ path: path.resolve('.env.test') });
const Knex = require('knex');
const sql = require('fake-tag');
const knexConfig = require('../knexfile');
const { POSTGRES_DATABASE } = require('../env');

module.exports = async function globalSetup() {
  const knex = Knex(knexConfig);
  try {
    await knex.raw(sql`DROP DATABASE IF EXISTS ${POSTGRES_DATABASE}`);
    await knex.raw(sql`CREATE DATABASE ${POSTGRES_DATABASE}`);
    await knex.migrate.latest();
    await knex.seed.run();
  } finally {
    await knex.destroy();
  }
};
