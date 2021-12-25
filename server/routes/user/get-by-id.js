'use strict';

const Joi = require('joi');

module.exports = function applyGetUserByIdRoute(router, { knex, validator }) {
  router.get(
    '/user/:id',

    validator.params(Joi.object({
      id: Joi.string().uuid().required(),
    }).required()),

    async (req, res) => {
      const user = await knex('users')
        .select('id', 'nick', 'email', 'createdAt')
        .where('id', req.params.id)
        .first();

      if (user) res.json(user);
      else res.sendStatus(404);
    },
  );
};
