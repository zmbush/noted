
exports.up = function(knex, Promise) {
  return knex.schema.createTable('cards', (table) => {
    table.bigIncrements();
    table.bigInteger('user_id');
    table.string('permalink');
    table.string('title');
    table.text('contents');
    table.timestamps();

    table.unique(['user_id', 'permalink']);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('cards');
};
