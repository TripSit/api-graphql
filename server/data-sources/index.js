'use strict';

const Database = require('./database');
const knexConfig = require('../../knexfile');

module.exports = function createDataSources() {
  return {
    db: new Database(knexConfig),
  };
};
