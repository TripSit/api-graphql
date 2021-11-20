'use strict';

exports.up = async function up(knex) {
  function drugsTable(table) {
    table.text('summary');
    table.text('psychonautwikiSlug');
    table.text('erowidExperiencesUrl');

    table
      .boolean('deleted')
      .notNullable()
      .defaultTo(false);

    table
      .uuid('createdBy')
      .notNullable()
      .references('id')
      .inTable('users');

    table
      .timestamp('createdAt')
      .notNullable()
      .defaultTo(knex.fn.now());
  }

  function drugNamesTable(table) {
    table
      .uuid('drugId')
      .notNullable()
      .references('id')
      .inTable('drugs')
      .onDelete('CASCADE');

    table.text('name').notNullable();

    table
      .enum('type', [
        'COMMON',
        'SUBSTITUTIVE',
        'SYSTEMATIC',
      ], {
        useNative: true,
        enumName: 'drug_name_type',
      })
      .notNullable()
      .defaultTo('COMMON');

    table
      .boolean('primary')
      .notNullable()
      .defaultTo(false);

    table
      .timestamp('createdAt')
      .notNullable()
      .defaultTo(knex.fn.now());
  }

  function drugVariantsTable(table) {
    table
      .uuid('drugId')
      .notNullable()
      .references('id')
      .inTable('drugs')
      .onDelete('CASCADE');

    table.text('name');

    table
      .boolean('isDefault')
      .notNullable()
      .defaultTo(false);

    table
      .timestamp('createdAt')
      .notNullable()
      .defaultTo(knex.fn.now());
  }

  function drugRoasTable(table) {
    table
      .uuid('drugVariantId')
      .notNullable()
      .references('id')
      .inTable('drugVariants')
      .onDelete('CASCADE');

    table
      .enum('route', [
        'ORAL',
        'INSUFFLATED',
        'INHALED',
        'TOPICAL',
        'SUBLINGUAL',
        'BUCCAL',
        'RECTAL',
        'INTRAMUSCULAR',
        'INTRAVENOUS',
        'SUBCUTANIOUS',
        'TRANSDERMAL',
      ], {
        useNative: true,
        enumName: 'drug_roa',
      })
      .notNullable();

    table.float('doseThreshold');
    table.float('doseLight');
    table.float('doseCommon');
    table.float('doseStrong');
    table.float('doseHeavy');
    table.text('doseWarning');

    table.float('durationTotalMin');
    table.float('durationTotalMax');
    table.float('durationOnsetMin');
    table.float('durationOnsetMax');
    table.float('durationComeupMin');
    table.float('durationComeupMax');
    table.float('durationPeakMin');
    table.float('durationPeakMax');
    table.float('durationOffsetMin');
    table.float('durationOffsetMax');
    table.float('durationAfterEffectsMin');
    table.float('durationAfterEffectsMax');

    table
      .timestamp('createdAt')
      .notNullable()
      .defaultTo(knex.fn.now());
  }

  await knex.schema
    .createTable('drugs', table => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();
      drugsTable(table);
    })
    .createTable('drugsHistory', table => {
      table
        .uuid('id')
        .notNullable()
        .references('id')
        .inTable('drugs');
      drugsTable(table);
    })
    .createTable('drugNames', table => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();
      drugNamesTable(table);
    })
    .createTable('drugNamesHistory', table => {
      table
        .uuid('id')
        .notNullable()
        .references('id')
        .inTable('drugNames');
      drugNamesTable(table);
    })
    .createTable('drugVariants', table => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();
      drugVariantsTable(table);
    })
    .createTable('drugVariantsHistory', table => {
      table
        .uuid('id')
        .notNullable()
        .references('id')
        .inTable('drugVariants');
      drugVariantsTable(table);
    })
    .createTable('drugRoas', table => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();
      drugRoasTable(table);
    })
    .createTable('drugRoasHistory', table => {
      table
        .uuid('id')
        .notNullable()
        .references('id')
        .inTable('drugRoas');
      drugRoasTable(table);
    });
};

exports.down = async function down(knex) {
  await knex.schema
    .dropTableIfExists('drugRoasHistory')
    .dropTableIfExists('drugRoas')
    .dropTableIfExists('drugVariantsHistory')
    .dropTableIfExists('drugVariants')
    .dropTableIfExists('drugNamesHistory')
    .dropTableIfExists('drugNames')
    .dropTableIfExists('drugsHistory')
    .dropTableIfExists('drugs');

  await knex.raw('DROP TYPE IF EXISTS "drug_name_type"');
  await knex.raw('DROP TYPE IF EXISTS "drug_roa"');
  await knex.raw('DROP TYPE IF EXISTS "drug_psychoactive_class"');
};
