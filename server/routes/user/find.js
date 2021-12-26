'use strict';

const Joi = require('joi');

module.exports = function applyFindUserRoute(router, { knex, validator }) {
  router.get(
    '/user',

    validator.query(Joi.object({
      nick: Joi.string().trim(),
    })),

    async (req, res) => {
      const sqlQuery = knex('users').select('id', 'nick', 'email', 'createdAt');
      if (req.query.nick) {
        sqlQuery.where(knex.raw('LOWER("nick") = ?', req.query.nick.toLowerCase()));
      }
      res.json(await sqlQuery);
    },
  );
};
