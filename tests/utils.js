'use strict';

const path = require('path');
require('dotenv').config({ path: path.resolve('.env.test') });
const Knex = require('knex');
const knexCleaner = require('knex-cleaner');
const knexConfig = require('../knexfile');

const knex = Knex(knexConfig);
exports.knex = knex;

exports.resetDb = async function resetDb() {
  await knex.raw('DROP DATABASE IF EXISTS postgres_test');
  await knex.raw('CREATE DATABASE postgres_test');
};

exports.cleanDb = async function cleanDb(options) {
  return knexCleaner.clean(knex, {
    mode: 'truncate',
    restartIdentity: true,
    ...options,
  });
};
