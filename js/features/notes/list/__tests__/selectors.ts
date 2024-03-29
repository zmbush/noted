// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { rootReducer } from 'features/redux/store';

import { NoteWithTags } from 'data/types';

import { getNotes } from '../api';
import {
  getLinkIds,
  getSubNotes,
  getSortedNoteIds,
  getIsNotArchived,
  getHasArchivedChild,
} from '../selectors';

const baseNote: NoteWithTags = {
  id: 0,
  user_id: 0,
  title: '',
  body: 'body',
  tags: [],
  parent_note_id: 0,
  updated_at: '',
  archived: false,
  created_at: '',
  pinned: false,
};

describe('getLinkIds()', () => {
  test('returns empty map for empty notes map', () => {
    expect(getLinkIds(rootReducer(undefined as any, { type: '' }))).toEqual({});
  });

  test('works with several notes', () => {
    const state = rootReducer(
      undefined as any,
      getNotes.fulfilled(
        [
          { ...baseNote, id: 1, title: 'Test 1' },
          { ...baseNote, id: 2, title: 'Test 2' },
          { ...baseNote, id: 3, title: 'Test 3' },
          { ...baseNote, id: 4, title: 'Test 4' },
        ],
        '',
        undefined as any,
        undefined as any,
      ),
    );

    const expected = {
      'Test 1': new Set([1]),
      'Test 2': new Set([2]),
      'Test 3': new Set([3]),
      'Test 4': new Set([4]),
      Test: new Set([1, 2, 3, 4]),
    };

    expect(getLinkIds(state)).toEqual(expected);
  });
});

describe('getTopLevelNotes()', () => {
  test('returns an empty map for empty notes map', () => {
    expect(getSubNotes(rootReducer(undefined as any, { type: '' }), { noteId: null })).toEqual({});
  });

  test('works with several notes', () => {
    const state = rootReducer(
      undefined as any,
      getNotes.fulfilled(
        [
          { ...baseNote, id: 1, title: 'Test 1' },
          { ...baseNote, id: 2, title: 'Test 2', parent_note_id: 3 },
          { ...baseNote, id: 3, title: 'Test 3' },
          { ...baseNote, id: 4, title: 'Test 4', parent_note_id: 3 },
        ],
        '',
        undefined as any,
        undefined as any,
      ),
    );

    const expected = {
      1: {
        ...baseNote,
        id: 1,
        title: 'Test 1',
      },
      3: {
        ...baseNote,
        id: 3,
        title: 'Test 3',
      },
    };

    expect(getSubNotes(state, { noteId: null })).toEqual(expected);
  });
});

describe('getSubNotes()', () => {
  test('returns an empty map for empty notes map', () => {
    expect(
      getSubNotes(rootReducer(undefined as any, { type: '' }), {
        noteId: 0,
      }),
    ).toEqual({});
  });

  test('works with several notes', () => {
    const state = rootReducer(
      undefined as any,
      getNotes.fulfilled(
        [
          { ...baseNote, id: 1, title: 'Test 1' },
          { ...baseNote, id: 2, title: 'Test 2', parent_note_id: 3 },
          { ...baseNote, id: 3, title: 'Test 3' },
          { ...baseNote, id: 4, title: 'Test 4', parent_note_id: 3 },
        ],
        '',
        undefined as any,
        undefined as any,
      ),
    );

    const expected = {
      2: {
        ...baseNote,
        id: 2,
        title: 'Test 2',
        parent_note_id: 3,
      },
      4: {
        ...baseNote,
        id: 4,
        title: 'Test 4',
        parent_note_id: 3,
      },
    };

    expect(getSubNotes(state, { noteId: 3 })).toEqual(expected);
  });
});

describe('getIsNotArchived()', () => {
  test('returns an empty map for empty notes map', () => {
    expect(getIsNotArchived(rootReducer(undefined as any, { type: '' }))).toEqual({});
  });

  test('works with several notes', () => {
    const state = rootReducer(
      undefined as any,
      getNotes.fulfilled(
        [
          { ...baseNote, id: 1 },
          { ...baseNote, id: 2, archived: true },
          { ...baseNote, id: 3, archived: true },
          { ...baseNote, id: 4 },
        ],
        '',
        undefined as any,
        undefined as any,
      ),
    );
    const expected = {
      1: true,
      2: false,
      3: false,
      4: true,
    };

    expect(getIsNotArchived(state)).toEqual(expected);
  });
});

describe('getHasArchivedChild()', () => {
  test('returns an empty map for empty notes map', () => {
    expect(getHasArchivedChild(rootReducer(undefined as any, { type: '' }))).toEqual({});
  });

  test('works with several notes', () => {
    const state = rootReducer(
      undefined as any,
      getNotes.fulfilled(
        [
          { ...baseNote, id: 1 },
          { ...baseNote, id: 2, archived: true },
          { ...baseNote, id: 3, archived: true },
          { ...baseNote, id: 4 },
          { ...baseNote, id: 5, parent_note_id: 4 },
          { ...baseNote, id: 6, parent_note_id: 5, archived: true },
        ],
        '',
        undefined as any,
      ),
    );
    const expected = {
      1: false,
      2: true,
      3: true,
      4: true,
      5: true,
      6: true,
    };

    expect(getHasArchivedChild(state)).toEqual(expected);
  });
});

describe('getSortedNoteIds()', () => {
  test('returns an empty map for empty notes map', () => {
    expect(getSortedNoteIds(rootReducer(undefined as any, { type: '' }))).toEqual([]);
  });

  test('works with several notes', () => {
    const state = rootReducer(
      undefined as any,
      getNotes.fulfilled(
        [
          {
            ...baseNote,
            id: 1,
            title: 'Test 1',
            parent_note_id: 4,
            updated_at: '3',
          },
          {
            ...baseNote,
            id: 2,
            title: 'Test 2',
            parent_note_id: 3,
            updated_at: '2',
          },
          {
            ...baseNote,
            id: 3,
            title: 'Test 3',
            updated_at: '1',
          },
          {
            ...baseNote,
            id: 4,
            title: 'Test 4',
            parent_note_id: 3,
            updated_at: '2',
          },
        ],
        '',
        undefined as any,
        undefined as any,
      ),
    );

    expect(getSortedNoteIds(state)).toEqual([1, 4, 2, 3]);
  });
});
