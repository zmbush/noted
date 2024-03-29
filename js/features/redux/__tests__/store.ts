// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { rootReducer } from '../store';

describe('data::reducers()', () => {
  test('matches snapshot', () => {
    expect(rootReducer(undefined as any, { type: null })).toMatchInlineSnapshot(`
      Object {
        "errorTracking": Object {
          "any": null,
        },
        "noteEdit": Object {
          "editingNote": null,
        },
        "noteLoading": Object {},
        "notes": Object {
          "entities": Object {},
          "ids": Array [],
        },
        "requestTracking": Object {
          "inProgress": Object {},
        },
        "user": Object {
          "isSignedIn": false,
          "user": null,
        },
      }
    `);
  });
});
