// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

const Mousetrap = jest.genMockFromModule('mousetrap');

class MockedMousetrap extends Mousetrap {
  constructor() {
    super(arguments);
  }

  bind(keys, callback, action) {
    super.bind(keys, callback, action);
  }

  static init() {
    var documentMousetrap = new MockedMousetrap(document);
    for (var method in documentMousetrap) {
      if (method.charAt(0) !== '_') {
        MockedMousetrap[method] = (function(method) {
          return function() {
            return documentMousetrap[method].apply(
              documentMousetrap,
              arguments
            );
          };
        })(method);
      }
    }
  }
}

MockedMousetrap.init();

module.exports = MockedMousetrap;
