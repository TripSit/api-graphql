'use strict';

const applyGetUserById = require('./get-by-id');
const applyFindUser = require('./find');
const applyCreateUser = require('./create');

module.exports = function applyUserRoutes(router, deps) {
  applyGetUserById(router, deps);
  applyFindUser(router, deps);
  applyCreateUser(router, deps);
};
