// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { makeTestNote } from 'data/test-utils';
import { signOutUser } from 'data/user/api';

import { deleteNote, getNotes, updateNote } from '../api';
import notes from '../slice';

describe('reducers::notes()', () => {
  const getInitial = () => notes(undefined, { type: '' });

  test('returns initial state', () => {
    expect(getInitial()).toEqual({ entities: {}, ids: [] });
  });

  test('responds to events', () => {
    let noteOne = makeTestNote({ id: 1, title: 'title', body: 'body' });
    let noteTwo = makeTestNote({ id: 2, title: 'title 2', body: 'body' });
    let state = getInitial();

    state = notes(state, getNotes.fulfilled([noteOne], ''));
    expect(state).toMatchInlineSnapshot(`
      Object {
        "entities": Object {
          "1": Object {
            "archived": false,
            "body": "body",
            "created_at": "",
            "id": 1,
            "parent_note_id": 0,
            "pinned": false,
            "tags": Array [],
            "title": "title",
            "updated_at": "",
            "user_id": -1,
          },
        },
        "ids": Array [
          1,
        ],
      }
    `);

    noteOne = { ...noteOne, title: 'title 3' };
    state = notes(state, updateNote.fulfilled(noteOne, '', { noteId: noteOne.id, note: noteOne }));
    expect(state).toMatchInlineSnapshot(`
      Object {
        "entities": Object {
          "1": Object {
            "archived": false,
            "body": "body",
            "created_at": "",
            "id": 1,
            "parent_note_id": 0,
            "pinned": false,
            "tags": Array [],
            "title": "title 3",
            "updated_at": "",
            "user_id": -1,
          },
        },
        "ids": Array [
          1,
        ],
      }
    `);

    noteTwo = { ...noteTwo, title: 'title 4' };
    state = notes(state, updateNote.fulfilled(noteTwo, '', { noteId: noteTwo.id, note: noteTwo }));
    expect(state).toMatchInlineSnapshot(`
      Object {
        "entities": Object {
          "1": Object {
            "archived": false,
            "body": "body",
            "created_at": "",
            "id": 1,
            "parent_note_id": 0,
            "pinned": false,
            "tags": Array [],
            "title": "title 3",
            "updated_at": "",
            "user_id": -1,
          },
          "2": Object {
            "archived": false,
            "body": "body",
            "created_at": "",
            "id": 2,
            "parent_note_id": 0,
            "pinned": false,
            "tags": Array [],
            "title": "title 4",
            "updated_at": "",
            "user_id": -1,
          },
        },
        "ids": Array [
          1,
          2,
        ],
      }
    `);

    state = notes(state, deleteNote.fulfilled(noteTwo.id, '', noteTwo.id));
    expect(state).toMatchInlineSnapshot(`
      Object {
        "entities": Object {
          "1": Object {
            "archived": false,
            "body": "body",
            "created_at": "",
            "id": 1,
            "parent_note_id": 0,
            "pinned": false,
            "tags": Array [],
            "title": "title 3",
            "updated_at": "",
            "user_id": -1,
          },
        },
        "ids": Array [
          1,
        ],
      }
    `);

    state = notes(state, signOutUser.fulfilled(undefined, '', undefined));
    expect(state.ids).toHaveLength(0);
    expect(state).toMatchInlineSnapshot(`
      Object {
        "entities": Object {},
        "ids": Array [],
      }
    `);
  });
});
