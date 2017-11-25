
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table) {
    table.bigIncrements();
    table.string('email');
    table.string('provider_id');
    table.text('image_url');
    table.string('user_name');
    table.timestamps();

    table.unique(['provider_id']);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
