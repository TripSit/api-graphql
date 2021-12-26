'use strict';

const create = require('./create');
const update = require('./update');

module.exports = function applyTripsitRoutes(router, deps) {
  create(router, deps);
  update(router, deps);
};
