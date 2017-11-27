import bookshelf from '~/src/models/bookshelf';

const User = bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
});

export default User;
