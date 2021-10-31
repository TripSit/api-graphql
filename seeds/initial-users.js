'use strict';

const argon = require('argon2');

exports.seed = async function seed(knex) {
  await knex('users').del();
  return knex('users').insert([
    {
      nick: 'SevenCats',
      email: 'sevencats@tripsit.me',
      passwordHash: await argon.hash('P@ssw0rd'),
      accessLevel: 'ADMINISTRATOR',
    },
    {
      nick: 'Moonbear',
      email: 'moonbear@tripsit.me',
      passwordHash: await argon.hash('P@ssw0rd'),
      accessLevel: 'ADMINISTRATOR',
    },
    {
      nick: 'reality',
      email: 'reality@tripsit.me',
      passwordHash: await argon.hash('P@ssw0rd'),
      accessLevel: 'ADMINISTRATOR',
    },
    {
      nick: 'winter',
      email: 'winter@tripsit.me',
      passwordHash: await argon.hash('P@ssw0rd'),
      accessLevel: 'ADMINISTRATOR',
    },
    {
      nick: 'sHr00m',
      email: 'shr00m@tripsit.me',
      passwordHash: await argon.hash('P@ssw0rd'),
      accessLevel: 'ADMINISTRATOR',
    },
    {
      nick: 'potato',
      email: 'potato@tripsit.me',
      passwordHash: await argon.hash('P@ssw0rd'),
      accessLevel: 'MODERATOR',
    },
  ]);
};
