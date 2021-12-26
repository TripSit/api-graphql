'use strict';

const path = require('path');

module.exports = {
  globalSetup: path.resolve('tests/global-setup.js'),
  globalTeardown: path.resolve('tests/global-teardown.js'),
  setupFilesAfterEnv: [path.resolve('jest.setup.js')],
};
