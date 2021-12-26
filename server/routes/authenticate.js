'use strict';

const Joi = require('joi');
const argon = require('argon2');

module.exports = function applyAuthenticateRoute(router, { knex, validator }) {
  router.post(
    '/authenticate',

    validator.body(Joi.object({
      nick: Joi.string().max(32).required(),
      password: Joi.string().required(),
    }).required()),

    async (req, res) => {
      const { passwordHash } = await knex('users')
        .select('passwordHash')
        .where('nick', req.body.nick)
        .first()
        .then(user => user || {});

      if (!passwordHash || !(await argon.verify(passwordHash))) res.sendStatus(301);
      else res.sendStatus(201);
    },
  );
};
