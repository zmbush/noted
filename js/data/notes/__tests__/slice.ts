// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { signOutUser } from 'data/user/api';
import { makeTestNote } from 'data/utils.forTesting';

import { deleteNote, getNotes, updateNote } from '../api';
import notes from '../slice';

describe('reducers::notes()', () => {
  const getInitial = () => notes(undefined, { type: '' });

  test('returns initial state', () => {
    expect(getInitial()).toEqual({ entities: {}, ids: [] });
  });

  test('responds to events', () => {
    let noteOne = makeTestNote({ title: 'title', body: 'body' });
    let noteTwo = makeTestNote({ title: 'title 2', body: 'body' });
    let state = getInitial();

    state = notes(state, getNotes.fulfilled([noteOne], ''));
    expect(state).toMatchSnapshot();

    noteOne = { ...noteOne, title: 'title 3' };
    state = notes(state, updateNote.fulfilled(noteOne, '', { noteId: noteOne.id, note: noteOne }));
    expect(state).toMatchSnapshot();

    noteTwo = { ...noteTwo, title: 'title 4' };
    state = notes(state, updateNote.fulfilled(noteTwo, '', { noteId: noteTwo.id, note: noteTwo }));
    expect(state).toMatchSnapshot();

    state = notes(state, deleteNote.fulfilled(noteTwo.id, '', noteTwo.id));
    expect(state).toMatchSnapshot();

    state = notes(state, signOutUser.fulfilled(undefined, '', undefined));
    expect(state.ids).toHaveLength(0);
    expect(state).toMatchSnapshot();
  });
});
