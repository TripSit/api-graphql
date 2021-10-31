'use strict';

exports.up = async function up(knex) {
  await knex.raw('CREATE EXTENSION "uuid-ossp"');
  await knex.schema
    .createTable('users', table => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();

      table
        .string('nick', 32)
        .notNullable()
        .unique()
        .index();

      table
        .text('passwordHash')
        .notNullable();

      table.string('email', 320).unique();

      table
        .enum('accessLevel', [
          'USER',
          'TRIPSITTER',
          'MODERATOR',
          'ADMINISTRATOR',
        ], {
          useNative: true,
          enumName: 'user_access_level',
        })
        .notNullable()
        .defaultTo('USER');

      table
        .timestamp('createdAt')
        .notNullable()
        .defaultTo(knex.fn.now());
    })
    .createTable('userReports', table => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();

      table
        .uuid('userId')
        .notNullable()
        .references('id')
        .inTable('users');

      table
        .enum('type', [
          'REPORT',
          'NOTE',
          'QUIET',
          'BAN',
        ], {
          useNative: true,
          enumName: 'user_report_type',
        })
        .notNullable();

      table.text('note');

      table.timestamp('expiresAt');

      table
        .uuid('createdBy')
        .notNullable()
        .references('id')
        .inTable('users');

      table
        .timestamp('createdAt')
        .notNullable()
        .defaultTo(knex.fn.now());
    });
};

exports.down = async function down(knex) {
  await knex.schema
    .dropTableIfExists('userReports')
    .dropTableIfExists('users');
  await knex.raw('DROP TYPE IF EXISTS "user_access_level"');
  await knex.raw('DROP TYPE IF EXISTS "user_report_type"');
  await knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
};
