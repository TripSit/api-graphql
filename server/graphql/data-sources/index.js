'use strict';

const Database = require('./database');
const Discord = require('./discord');

module.exports = function createDataSources({ knex }) {
  return {
    db: new Database(knex),
    discord: new Discord(),
  };
};
