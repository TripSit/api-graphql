'use strict';

const Joi = require('joi');
const argon = require('argon2');

module.exports = function applyCreateUserRoute(router, { knex, validator }) {
  router.post(
    '/user',

    validator.body(Joi.object({
      nick: Joi.string().max(32).required(),
      password: Joi.string().min(6).required(),
      email: Joi.string().trim().email(),
    }).required()),

    async (req, res) => {
      const user = await knex('users')
        .insert({
          nick: req.body.nick,
          email: req.body.email,
          password: await argon.hash(req.body.password),
        })
        .returning('*')
        .then(([a]) => a);

      res.status(201).json(user);
    },
  );
};
