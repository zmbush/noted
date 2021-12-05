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
import { NewNote, NoteWithTags, UpdateNote } from 'data/types';

export const prefix = 'notes';
const name = (n: string) => `${prefix}/${n}`;

export const getNotes = createAsyncThunk(name('list'), async (_: void, { rejectWithValue }) => {
  try {
    return await api.note.list();
  } catch (e) {
    throw rejectWithValue(e);
  }
});

export const updateNote = createAsyncThunk(
  name('update'),
  async (
    {
      id: noteId,
      tags,
      ...note
    }: UpdateNote & Partial<Pick<NoteWithTags, 'tags'>> & { id: number },
    { rejectWithValue },
  ) => {
    try {
      let result = await api.note.update(noteId, note);
      if (tags) {
        result = await api.note.setTags(result.id, tags);
      }
      return result;
    } catch (e) {
      throw rejectWithValue(e);
    }
  },
);
export const createNote = createAsyncThunk(
  name('create'),
  async ({ tags, ...note }: NewNote & Pick<NoteWithTags, 'tags'>, { rejectWithValue }) => {
    try {
      const result = await api.note.create(note);
      return await api.note.setTags(result.id, tags);
    } catch (e) {
      throw rejectWithValue(e);
    }
  },
);

export const deleteNote = createAsyncThunk(
  name('delete'),
  async (noteId: number, { rejectWithValue }) => {
    try {
      await api.note.delete(noteId);
      return noteId;
    } catch (e) {
      throw rejectWithValue(e);
    }
  },
);
