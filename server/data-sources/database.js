'use strict';

const { SQLDataSource } = require('datasource-sql');

module.exports = class Database extends SQLDataSource {
  constructor(knexConfig, logger) {
    super(knexConfig);
    this.logger = logger;
  }
};
