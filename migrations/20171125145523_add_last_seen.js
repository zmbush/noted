
exports.up = function(knex, Promise) {
  return knex.schema.table('users', (users) => {
    users.timestamp('last_seen');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', (users) => {
    users.dropColumn('last_seen');
  });
};
