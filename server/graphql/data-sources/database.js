'use strict';

const { DataSource } = require('apollo-datasource');

module.exports = class Database extends DataSource {
  constructor(knex, ...args) {
    super(knex, ...args);
    this.knex = knex;
  }
};
