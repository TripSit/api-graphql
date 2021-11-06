'use strict';

const Database = require('./database');
const Discord = require('./discord');
const knexConfig = require('../../knexfile');

module.exports = function createDataSources(deps) {
  return {
    db: new Database(knexConfig, deps),
    discord: new Discord(deps),
  };
};
