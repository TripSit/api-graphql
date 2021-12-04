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
  constructor(...args) {
    super(...args);
    this.client = new Client({
      intents: [Intents.FLAGS.GUILDS],
    });
  }

  initialize({ context }) {
    this.client.once('ready', () => {
      context.logger.info('Discord client is running...');
    });
  }

  async getUser(query) {
    const user = /^.{3,32}#[0-9]{4}$/.test(query)
      ? this.client.users.cache(a => a.tag === query)
      : this.client.users.fetch(query);
    return fromUser(user);
  }
};
