// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import { getLinkIds } from '../selectors';

describe('getLinkIds()', () => {
  test('returns empty map for empty notes map', () => {
    expect(getLinkIds(new Map())).toEqual(new Map());
  });

  test('works with several notes', () => {
    const notes = new Map();
    notes.set(1, { id: 1, title: 'Test 1' });
    notes.set(2, { id: 2, title: 'Test 2' });
    notes.set(3, { id: 3, title: 'Test 3' });
    notes.set(4, { id: 4, title: 'Test 4' });

    const expected = new Map();
    expected.set('Test 1', new Set([1]));
    expected.set('Test 2', new Set([2]));
    expected.set('Test 3', new Set([3]));
    expected.set('Test 4', new Set([4]));
    expected.set('Test', new Set([1, 2, 3, 4]));

    expect(getLinkIds(notes)).toEqual(expected);
  });
});
