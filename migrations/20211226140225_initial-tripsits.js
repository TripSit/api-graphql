'use strict';

exports.up = async function up(knex) {
  await knex.schema
    .createTable('tripsits', table => {
      table
        .uuid('id')
        .notNullable()
        .deafultTo(knex.raw('generate_uuid_v4()'))
        .primary();

      table
        .specificType('targetId', 'CHAR(18)')
        .notNullable()
        .references('id')
        .inTable('discordAccounts');

      table
        .specificType('initiatorId', 'CHAR(18)')
        .notNullable()
        .references('id')
        .inTable('discordAccounts');

      table
        .boolean('isUrgent')
        .notNullable()
        .defaultTo(false);

      table
        .timestamp('updatedAt')
        .notNullable()
        .defaultTo(knex.fn.now());

      table
        .timestamp('createddAt')
        .notNullable()
        .defaultTo(knex.fn.now());
    });
};

exports.down = async function down(knex) {
  await knex.schema
    .dropTableIfExists('tripsits');
};
