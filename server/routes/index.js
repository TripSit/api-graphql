'use strict';

const express = require('express');
const Router = require('express-promise-router');
const { createValidator } = require('express-joi-validation');
const applyUserRoutes = require('./user');

module.exports = function createRoutes(baseDeps) {
  const deps = {
    ...baseDeps,
    validator: createValidator(),
  };

  const router = Router();
  router.use(express.json());
  [applyUserRoutes].forEach(applyRoutes => {
    applyRoutes(router, deps);
  });
  return router;
};
