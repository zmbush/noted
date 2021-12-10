// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import { NoteWithTags } from 'data/types';
import { signOutUser } from 'data/user/api';

import { getNotes, updateNote, createNote, deleteNote, prefix } from './api';

export const notesAdapter = createEntityAdapter<NoteWithTags>();

export const notesSlice = createSlice({
  name: prefix,
  initialState: notesAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getNotes.fulfilled, (state, { payload }) => {
        notesAdapter.addMany(state, payload);
      })
      .addCase(updateNote.fulfilled, (state, { payload }) => {
        notesAdapter.setOne(state, payload);
      })
      .addCase(createNote.fulfilled, (state, { payload }) => {
        notesAdapter.addOne(state, payload);
      })
      .addCase(deleteNote.fulfilled, (state, { payload }) => {
        notesAdapter.removeOne(state, payload);
      })
      .addCase(signOutUser.fulfilled, (state) => {
        notesAdapter.removeAll(state);
      });
  },
});

export default notesSlice.reducer;
