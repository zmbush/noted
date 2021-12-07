// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import api from 'api';
import { store } from 'data/store';
import { makeTestNote } from 'data/test-utils';

import * as notesApi from '../api';

beforeEach(() => {
  store.dispatch({ type: 'RESET' });
});

describe('getNotes', () => {
  it('handles success well', async () => {
    const note = makeTestNote();
    jest.spyOn(api.note, 'list').mockResolvedValueOnce([note]);
    await store.dispatch(notesApi.getNotes());
    expect(store.getState().notes.entities).toEqual({
      [note.id]: note,
    });
  });

  it('handles failure well', async () => {
    jest.spyOn(api.note, 'list').mockRejectedValueOnce({ code: 401, error: 'NotLoggedIn' });
    await store.dispatch(notesApi.getNotes());
    expect(store.getState().notes.entities).toEqual({});
    expect(store.getState().ui.lastError.any.code).toEqual(401);
  });
});

describe('createNote', () => {
  it('handles success well', async () => {
    const note = makeTestNote();
    jest.spyOn(api.note, 'create').mockResolvedValue(note);
    jest.spyOn(api.note, 'setTags').mockResolvedValue(note);
    await store.dispatch(notesApi.createNote(note));
    expect(store.getState().notes.entities).toEqual({
      [note.id]: note,
    });
  });

  it('handles failure well', async () => {
    jest.spyOn(api.note, 'create').mockRejectedValueOnce({ code: 401, error: 'NotLoggedIn' });
    await store.dispatch(notesApi.createNote(makeTestNote()));
    expect(store.getState().notes.entities).toEqual({});
    expect(store.getState().ui.lastError.any.code).toEqual(401);
  });
});

describe('updateNote', () => {
  it('handles success well', async () => {
    const note = makeTestNote();
    jest.spyOn(api.note, 'update').mockResolvedValue(note);
    jest.spyOn(api.note, 'setTags').mockResolvedValue(note);
    await store.dispatch(notesApi.updateNote(note));
    expect(store.getState().notes.entities).toEqual({ [note.id]: note });
  });

  it('handles failure well', async () => {
    jest.spyOn(api.note, 'update').mockRejectedValueOnce({ code: 401, error: 'NotLoggedIn' });
    await store.dispatch(notesApi.updateNote(makeTestNote({ id: 1 })));
    expect(store.getState().notes.entities).toEqual({});
    expect(store.getState().ui.lastError.any.code).toEqual(401);
  });
});

describe('deleteNotes', () => {
  const note = makeTestNote();

  beforeEach(async () => {
    jest.spyOn(api.note, 'list').mockResolvedValueOnce([note]);
    await store.dispatch(notesApi.getNotes());
    expect(store.getState().notes.entities).toEqual({
      [note.id]: note,
    });
  });

  it('handles success well', async () => {
    jest.spyOn(api.note, 'delete').mockResolvedValueOnce(undefined);
    await store.dispatch(notesApi.deleteNote(note.id));
    expect(store.getState().notes.entities).toEqual({});
  });

  it('handles failure well', async () => {
    jest.spyOn(api.note, 'delete').mockRejectedValueOnce({ code: 401, error: 'NotSignedIn' });
    await store.dispatch(notesApi.deleteNote(note.id));
    expect(store.getState().notes.entities).toEqual({
      [note.id]: note,
    });
    expect(store.getState().ui.lastError.any.code).toEqual(401);
  });
});
