/**
 * Used only to support ESLint.
 */

'use strict';

const { NODE_ENV } = require('./env');

module.exports = function babelConfig(api) {
  api.cache(NODE_ENV !== 'production');

  return {
    presets: [
      ['@babel/preset-env', {
        useBuiltIns: false,
      }]
    ]
  };
};
