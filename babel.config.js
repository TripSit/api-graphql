/**
 * Babel is only used for the purposes of ESLint supporting newer JS features
 */

'use strict';

module.exports = function babelConfig(api) {
  api.cache(process.env.NODE_ENV !== 'production');

  return {
    presets: ['@babel/preset-env'],
  };
};
