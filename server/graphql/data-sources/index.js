'use strict';

const Database = require('./database');
const Discord = require('./discord');
const knexConfig = require('../../../knexfile');

module.exports = function createDataSources() {
  return {
    db: new Database(knexConfig),
    discord: new Discord(),
  };
};
