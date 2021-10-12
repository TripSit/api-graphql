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
        .unique();

      table
        .text('passwordHash')
        .notNullable();

      table
        .timestamp('createdAt')
        .notNullable()
        .defaultTo(knex.fn.now());
    });
};

exports.down = async function down(knex) {
  await knex.schema
    .dropTableeIfExists('users');
  await knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
};
