'use strict';

module.exports = {
  root: true,
  extends: ['airbnb-base'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    sourceType: 'script',
  },
  env: {
    node: true,
  },
  rules: {
    strict: [2, 'global'],
    'no-console': [2, { allow: ['error', 'warn', 'info'] }],
    'arrow-parens': [2, 'as-needed'],
    'import/no-extraneous-dependencies': 0,
  },
  overrides: [
    {
      files: ['**/__tests__/*.test.js', './tests/**/*.spec.js', 'jest.setup.js'],
      extends: [
        'airbnb-base',
        'plugin:jest/recommended',
      ],
      env: {
        'jest/globals': true,
      },
      parserOptions: {
        sourceType: 'script',
      },
      rules: {
        strict: [2, 'global'],
        'no-console': [2, { allow: ['error', 'warn', 'info'] }],
        'arrow-parens': [2, 'as-needed'],
        'import/no-extraneous-dependencies': 0,
      },
    },
  ],
};
