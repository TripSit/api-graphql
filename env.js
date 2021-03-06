'use strict';

const path = require('path');
require('dotenv').config({
  path: process.env.NODE_ENV !== 'test' ? undefined : path.resolve('.env.test'),
});

exports.NODE_ENV = process.env.NODE_ENV;
exports.HTTP_PORT = parseInt(process.env.HTTP_PORT, 10);
exports.LOG_PATH = path.resolve(process.env.LOG_PATH);

exports.POSTGRES_HOST = process.env.POSTGRES_HOST;
exports.POSTGRES_PORT = parseInt(process.env.POSTGRES_PORT, 10);
exports.POSTGRES_USER = process.env.POSTGRES_USER;
exports.POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
