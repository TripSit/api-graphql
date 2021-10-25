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
        .timestamp('createdAt')
        .notNullable()
        .defaultTo(knex.fn.now());
    })
    .createTable('roles', table => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();

      table
        .text('name')
        .notNullable()
        .unique();

      table.text('description');
    })
    .createTable('userRoles', table => {
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
        .uuid('roleId')
        .notNullable()
        .references('id')
        .inTable('roles');

      table
        .uuid('createdBy')
        .notNullable()
        .references('id')
        .inTable('users');

      table
        .timestamp('createdAt')
        .notNullable()
        .defaultTo(knex.fn.now());
    })
    .createTable('discordAccounts', table => {
      table
        .string('id', 18)
        .notNullable()
        .unique()
        .primary();

      table
        .uuid('userId')
        .references('id')
        .inTable('users');

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
        });

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
    .dropTableIfExists('discordAccounts')
    .dropTableIfExists('userRoles')
    .dropTableIfExists('roles')
    .dropTableIfExists('users');
  await knex.raw('DROP TYPE IF EXISTS "user_report_type"');
  await knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
};
