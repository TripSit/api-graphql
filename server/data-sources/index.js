'use strict';

const Database = require('./database');
const Session = require('./session');
const knexConfig = require('../../knexfile');

module.exports = function createDataSources(logger) {
  return {
    db: new Database(knexConfig, logger),
    session: new Session(logger),
  };
};
