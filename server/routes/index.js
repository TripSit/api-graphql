'use strict';

const express = require('express');
const Router = require('express-promise-router');
const { createValidator } = require('express-joi-validation');
const user = require('./user');
const tripsit = require('./tripsit');

module.exports = function createRoutes(baseDeps) {
  const deps = {
    ...baseDeps,
    validator: createValidator(),
  };

  const router = Router();
  router.use(express.json());

  user(router, deps);
  tripsit(router, deps);

  return router;
};
