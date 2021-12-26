'use strict';

const Joi = require('joi');
const joiValidators = require('../../../utils/joi-validators');

module.exports = function applyCreateTripsit(router, { validator, knex }) {
  router.post(
    '/tripsit',

    validator.body(Joi.object({
      targetUserId: joiValidators.required(),
      initiatorUserId: joiValidators.required(),
    }).required()),

    async (req, res) => {
      await knex('tripsits');
    },
  );
};
