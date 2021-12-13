// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//

/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NoteEditState {
  editingNote: { id: 'new'; title?: string; parent_note_id?: number } | { id: number } | null;
}

const initialState: NoteEditState = {
  editingNote: null,
};

export const prefix = 'noteEdit';
const noteEditSlice = createSlice({
  name: prefix,
  initialState,
  reducers: {
    setEditingNote(state, { payload }: PayloadAction<NoteEditState['editingNote']>) {
      state.editingNote = payload;
    },
  },
});

export const { setEditingNote } = noteEditSlice.actions;
export default noteEditSlice.reducer;
