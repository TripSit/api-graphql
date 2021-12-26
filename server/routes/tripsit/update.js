'use strict';

const Joi = require('joi');
const joiValidators = require('../../../utils/joi-validators');

module.exports = function applyUpdateTripsitRoute(router, { validator, knex }) {
  router.patch(
    '/tripsit/:tripsitId',

    validator.params(Joi.object({
      tripsitId: Joi.string().uuid().required(),
    }).required()),

    validator.body(Joi.object({
      interactionUserId: joiValidators.discordId.required(),
      updates: Joi.object({
        isUrgent: Joi.boolean(),
      }).required(),
    }).required()),

    async (req, res) => {
      if (!req.params.interactionUserId) res.sendStatus(403);
      else {
        const isAuthorized = await knex('tripsits')
          .where('id', req.params.tripsitId)
          .where('targetId', req.body.interactionUserId)
          .select('id')
          .first()
          .then(Boolean);
        if (!isAuthorized) res.sendStatus(401);
        else {
          await knex('tripsits').update(req.body.updates).where('id', req.params.tripsitId);
          const tripsit = await knex('tripsits').where('id', req.params.tripsitId).first();
          res.status(200).json(tripsit);
        }
      }
    },
  );
};
