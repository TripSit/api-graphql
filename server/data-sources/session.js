'use strict';

const { promisify } = require('util');
const { createClient } = require('redis');

module.exports = class SessionDataSource {
  constructor(logger) {
    this.logger = logger;

    this.get = promisify(this.#client.get).bind(this.#client);
    this.set = promisify(this.#client.set).bind(this.#client);

    this.client.on('error', ex => {
      this.logger(`Redis Error: ${ex}`);
    });
  }

  #client = createClient();
};
