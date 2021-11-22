// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import {
  getTopLevelNotes,
  getLinkIds,
  getSubnotes,
  getSearchIndex,
  getFilteredSearchIndex,
  getSortedNoteIds,
} from '../selectors';
import rootReducer from '../reducers';
import { notesFetched } from '../actions';

describe('getLinkIds()', () => {
  test('returns empty map for empty notes map', () => {
    expect(getLinkIds(rootReducer(undefined, { type: '' }))).toEqual(new Map());
  });

  test('works with several notes', () => {
    const state = rootReducer(
      undefined,
      notesFetched([
        { id: 1, title: 'Test 1', body: 'body', tags: [], parent_note_id: 0 },
        { id: 2, title: 'Test 2', body: 'body', tags: [], parent_note_id: 0 },
        { id: 3, title: 'Test 3', body: 'body', tags: [], parent_note_id: 0 },
        { id: 4, title: 'Test 4', body: 'body', tags: [], parent_note_id: 0 },
      ]),
    );

    const expected = new Map();
    expected.set('Test 1', new Set([1]));
    expected.set('Test 2', new Set([2]));
    expected.set('Test 3', new Set([3]));
    expected.set('Test 4', new Set([4]));
    expected.set('Test', new Set([1, 2, 3, 4]));

    expect(getLinkIds(state)).toEqual(expected);
  });
});

describe('getTopLevelNotes()', () => {
  test('returns an empty map for empty notes map', () => {
    expect(getTopLevelNotes(rootReducer(undefined, { type: '' }))).toEqual(new Map());
  });

  test('works with several notes', () => {
    const state = rootReducer(
      undefined,
      notesFetched([
        { id: 1, title: 'Test 1', body: 'body', tags: [], parent_note_id: 0 },
        { id: 2, title: 'Test 2', body: 'body', tags: [], parent_note_id: 3 },
        { id: 3, title: 'Test 3', body: 'body', tags: [], parent_note_id: 0 },
        { id: 4, title: 'Test 4', body: 'body', tags: [], parent_note_id: 3 },
      ]),
    );

    const expected = new Map();
    expected.set(1, {
      id: 1,
      title: 'Test 1',
      body: 'body',
      tags: [],
      parent_note_id: 0,
    });
    expected.set(3, {
      id: 3,
      title: 'Test 3',
      body: 'body',
      tags: [],
      parent_note_id: 0,
    });

    expect(getTopLevelNotes(state)).toEqual(expected);
  });
});

describe('getSubnotes()', () => {
  test('returns an empty map for empty notes map', () => {
    expect(
      getSubnotes(rootReducer(undefined, { type: '' }), {
        note_id: 0,
      }),
    ).toEqual(new Map());
  });

  test('works with several notes', () => {
    const state = rootReducer(
      undefined,
      notesFetched([
        { id: 1, title: 'Test 1', body: 'body', tags: [], parent_note_id: 0 },
        { id: 2, title: 'Test 2', body: 'body', tags: [], parent_note_id: 3 },
        { id: 3, title: 'Test 3', body: 'body', tags: [], parent_note_id: 0 },
        { id: 4, title: 'Test 4', body: 'body', tags: [], parent_note_id: 3 },
      ]),
    );

    const expected = new Map();
    expected.set(2, {
      id: 2,
      title: 'Test 2',
      body: 'body',
      tags: [],
      parent_note_id: 3,
    });
    expected.set(4, {
      id: 4,
      title: 'Test 4',
      body: 'body',
      tags: [],
      parent_note_id: 3,
    });

    expect(getSubnotes(state, { note_id: 3 })).toEqual(expected);
  });
});

describe('getSearchIndex()', () => {
  test('returns an empty map for empty notes map', () => {
    expect(getSearchIndex(rootReducer(undefined, { type: '' }))).toEqual(new Map());
  });

  test('works with several notes', () => {
    const state = rootReducer(
      undefined,
      notesFetched([
        { id: 1, title: 'Test 1', body: 'body', tags: [], parent_note_id: 0 },
        { id: 2, title: 'Test 2', body: 'body', tags: [], parent_note_id: 3 },
        { id: 3, title: 'Test 3', body: 'body', tags: [], parent_note_id: 0 },
        { id: 4, title: 'Test 4', body: 'body', tags: [], parent_note_id: 3 },
      ]),
    );

    const expected = new Map();
    expected.set(1, {
      id: 1,
      title: 'Test 1',
      body: 'body',
      tags: [],
      parent_note_id: 0,
    });

    expected.set(2, {
      id: 2,
      title: 'Test 2',
      body: 'body',
      tags: [],
      parent_note_id: 3,
    });

    expected.set(3, {
      id: 3,
      title: 'Test 3 Test 2 Test 4',
      body: 'body body body',
      tags: [],
      parent_note_id: 0,
    });

    expected.set(4, {
      id: 4,
      title: 'Test 4',
      body: 'body',
      tags: [],
      parent_note_id: 3,
    });

    expect(getSearchIndex(state)).toEqual(expected);
  });
});

describe('getFilteredSearchIndex()', () => {
  test('returns an empty map for empty notes map', () => {
    expect(
      getFilteredSearchIndex(rootReducer(undefined, { type: '' }), {
        note_id: null,
      }),
    ).toEqual(new Map());
  });

  test('works with several notes', () => {
    const state = rootReducer(
      undefined,
      notesFetched([
        { id: 1, title: 'Test 1', body: 'body', tags: [], parent_note_id: 2 },
        { id: 2, title: 'Test 2', body: 'body', tags: [], parent_note_id: 3 },
        { id: 3, title: 'Test 3', body: 'body', tags: [], parent_note_id: 0 },
        { id: 4, title: 'Test 4', body: 'body', tags: [], parent_note_id: 3 },
      ]),
    );

    const expected = new Map();
    expected.set(2, {
      id: 2,
      title: 'Test 2 Test 1',
      body: 'body body',
      tags: [],
      parent_note_id: 3,
    });

    expected.set(4, {
      id: 4,
      title: 'Test 4',
      body: 'body',
      tags: [],
      parent_note_id: 3,
    });

    expect(getFilteredSearchIndex(state, { note_id: 3 })).toEqual(expected);

    const expected2 = new Map();
    expected2.set(3, {
      id: 3,
      title: 'Test 3 Test 2 Test 1 Test 4',
      body: 'body body body body',
      tags: [],
      parent_note_id: 0,
    });

    expect(getFilteredSearchIndex(state, { note_id: null })).toEqual(expected2);
  });
});

describe('getSortedNoteIds()', () => {
  test('returns an empty map for empty notes map', () => {
    expect(getSortedNoteIds(rootReducer(undefined, { type: '' }))).toEqual([]);
  });

  test('works with several notes', () => {
    const state = rootReducer(
      undefined,
      notesFetched([
        {
          id: 1,
          title: 'Test 1',
          body: 'body',
          tags: [],
          parent_note_id: 4,
          updated_at: '3',
        },
        {
          id: 2,
          title: 'Test 2',
          body: 'body',
          tags: [],
          parent_note_id: 3,
          updated_at: '2',
        },
        {
          id: 3,
          title: 'Test 3',
          body: 'body',
          tags: [],
          parent_note_id: 0,
          updated_at: '1',
        },
        {
          id: 4,
          title: 'Test 4',
          body: 'body',
          tags: [],
          parent_note_id: 3,
          updated_at: '2',
        },
      ]),
    );

    expect(getSortedNoteIds(state)).toEqual([1, 4, 2, 3]);
  });
});
