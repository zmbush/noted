// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Init from 'components/Init';

if (process.env.NODE_ENV !== 'production') {
  import('map.prototype.tojson');
}

ReactDOM.render(<Init />, document.getElementById('root'));
