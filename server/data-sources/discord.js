'use strict';

const { DataSource } = require('apollo-datasource');
const { Client, Intents } = require('discord.js');

function fromUser({ createdAt, ...user }) {
  return {
    ...user,
    joinedAt: createdAt,
  };
}

module.exports = class Discord extends DataSource {
  constructor({ logger }) {
    super();
    this.logger = logger;
    this.client = new Client({
      intents: [Intents.FLAGS.GUILDS],
    });
    this.client.once('ready', () => {
      this.logger.info('Discord client is running...');
    });
  }

  async getUserById(discordUserId) {
    return this.client.users.fetch(discordUserId).then(fromUser);
  }
};
