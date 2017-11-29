// @flow

import bookshelf from '~/src/models/bookshelf';
import '~/src/models/User';

export default bookshelf.model('Card', {
  tableName: 'cards',
  hasTimestamps: true,

  user() {
    return this.belongsTo('User');
  }
});
