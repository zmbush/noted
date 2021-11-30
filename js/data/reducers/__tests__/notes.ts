// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { notesFetched, updateNote, apiError, deleteNote, logOut } from 'data/actions';
import { NoteWithTags } from 'data/types';

import notes from '../notes';

describe('reducers::notes()', () => {
  let id = 1;
  const getInitial = () => notes(undefined, {});
  const makeNote = (title: string, body = 'Body', tags: string[] = []): NoteWithTags => {
    const d = {
      id,
      title,
      body,
      tags,
      created_at: '',
      updated_at: '',
      user_id: 1,
      archived: false,
      parent_note_id: 0,
      pinned: false,
    };
    id += 1;
    return d;
  };

  test('returns initial state', () => {
    expect(getInitial()).toEqual(new Map());
  });

  test('responds to events', () => {
    const noteOne = makeNote('title', 'body');
    const noteTwo = makeNote('title 2', 'body');
    let state = getInitial();

    state = notes(state, notesFetched([noteOne]));
    expect(state).toMatchSnapshot();

    noteOne.title = 'title 3';
    state = notes(state, updateNote(noteOne));
    expect(state).toMatchSnapshot();

    noteTwo.title = 'title 4';
    state = notes(state, updateNote(noteTwo));
    expect(state).toMatchSnapshot();

    state = notes(state, deleteNote(noteTwo.id));
    expect(state).toMatchSnapshot();

    expect(notes(state, apiError({ code: 401, error: '' }))).toMatchSnapshot();
    expect(notes(state, logOut())).toMatchSnapshot();
  });
});
