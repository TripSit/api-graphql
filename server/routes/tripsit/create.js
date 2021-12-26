'use strict';

const Joi = require('joi');
const joiValidators = require('../../../utils/joi-validators');

module.exports = function applyCreateTripsit(router, { validator, knex }) {
  router.post(
    '/tripsit',

    validator.body(Joi.object({
      targetUserId: joiValidators.discordId.required(),
      initiatorUserId: joiValidators.discordId.required(),
    }).required()),

    async (req, res) => {
      const tripsit = await knex('tripsits')
        .insert(req.body)
        .returning('*')
        .then(([a]) => a);
      res.status(201).json({ tripsit });
    },
  );
};
