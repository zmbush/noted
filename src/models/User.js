// @flow

import bookshelf from 'src/models/bookshelf';
import 'src/models/Card';

export default bookshelf.model('User', {
  tableName: 'users',
  hasTimestamps: true,

  cards() {
    return this.hasMany('Card');
  },
});
