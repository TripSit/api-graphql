'use strict';

const Joi = require('joi');

exports.discordId = Joi.string().regex(/^\d{16}$/);
