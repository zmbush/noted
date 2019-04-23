// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import notes from '../notes';
import { NotedEvent } from 'data/actions';
import { NoteData } from 'data/types';

describe('reducers::notes()', () => {
  let id = 1;
  const getInitial = () => notes(undefined, {});
  const makeNote = (
    title: string,
    body = 'Body',
    tags: string[] = []
  ): NoteData => ({
    id: id++,
    title,
    body,
    tags,
    created_at: '',
    updated_at: '',
    user_id: 1,
  });

  test('returns initial state', () => {
    expect(getInitial()).toEqual(new Map());
  });

  test('responds to events', () => {
    let note_one = makeNote('title', 'body');
    let state = getInitial();
    state = notes(state, {
      type: NotedEvent.NotesFetched,
      notes: [note_one],
    });

    expect(state).toMatchSnapshot();

    note_one.title = 'new_title';
    state = notes(state, { type: NotedEvent.NotesUpdateNote, note: note_one });
    expect(state).toMatchSnapshot();

    expect(
      notes(state, {
        type: NotedEvent.ApiError,
        error: { code: 401, error: '' },
      })
    ).toMatchSnapshot();
    expect(notes(state, { type: NotedEvent.UserSignedOut })).toMatchSnapshot();
  });
});
