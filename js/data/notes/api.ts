// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { createAsyncThunk } from '@reduxjs/toolkit';

import api from 'api';

import { NewNote, NoteWithTags, UpdateNote } from '../types';

export const getNotes = createAsyncThunk('notes/getList', (_: void) => api.note.list());
export const updateNote = createAsyncThunk(
  'notes/updateNote',
  async ({
    noteId,
    note: noteIn,
  }: {
    noteId: number;
    note: UpdateNote & Partial<Pick<NoteWithTags, 'tags'>>;
  }) => {
    const { tags, ...note } = noteIn;
    let result = await api.note.update(noteId, note);
    if (tags) {
      result = await api.note.setTags(result.id, tags);
    }
    return result;
  },
);
export const createNote = createAsyncThunk(
  'notes/createNote',
  async (noteIn: NewNote & Pick<NoteWithTags, 'tags'>) => {
    const { tags, ...note } = noteIn;
    const result = await api.note.create(note);
    return api.note.setTags(result.id, tags);
  },
);
export const deleteNote = createAsyncThunk('notes/deleteNote', async (noteId: number) => {
  await api.note.delete(noteId);
  return noteId;
});
