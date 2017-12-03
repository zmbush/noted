// Copyright 2017 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

// @flow

import bookshelf from 'src/models/bookshelf';
import 'src/models/User';

export default bookshelf.model('Card', {
  tableName: 'cards',
  hasTimestamps: true,

  user() {
    return this.belongsTo('User');
  },
});
