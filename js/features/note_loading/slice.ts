// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//

/* eslint-disable no-param-reassign */
import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';

import { updateNote, createNote } from 'features/notes/list/api';

export type NoteLoadingState = { [note_id: number]: string[] };
const initialState: NoteLoadingState = {};

export const prefix = 'noteLoading';

export const uiSlice = createSlice({
  name: prefix,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const noteStartEditing = <
      V,
      Ty extends string,
      T extends { id: number } | { parent_note_id?: number | null },
    >(
      state: Draft<NoteLoadingState>,
      action: PayloadAction<V, Ty, { arg: T; requestId: string }>,
    ) => {
      let id: number;
      if ('id' in action.meta.arg) {
        id = action.meta.arg.id;
      } else if ('parent_note_id' in action.meta.arg && action.meta.arg.parent_note_id) {
        id = action.meta.arg.parent_note_id;
      } else {
        // We can't track it.
        return;
      }
      state[id] = [...new Set([...(state[id] || []), action.meta.requestId])];
    };

    const noteDoneEditing = <
      V,
      Ty extends string,
      T extends { id: number } | { parent_note_id?: number | null },
    >(
      state: Draft<NoteLoadingState>,
      action: PayloadAction<V, Ty, { arg: T; requestId: string }>,
    ) => {
      let id: number;
      if ('id' in action.meta.arg) {
        id = action.meta.arg.id;
      } else if ('parent_note_id' in action.meta.arg && action.meta.arg.parent_note_id) {
        id = action.meta.arg.parent_note_id;
      } else {
        // We can't track it.
        return;
      }
      const changing = new Set(state[id] || []);
      changing.delete(action.meta.requestId);
      if (changing.size > 0) {
        state[id] = [...changing];
      } else {
        delete state[id];
      }
    };
    builder.addCase(updateNote.pending, noteStartEditing);
    builder.addCase(createNote.pending, noteStartEditing);

    builder.addCase(updateNote.fulfilled, noteDoneEditing);
    builder.addCase(updateNote.rejected, noteDoneEditing);
    builder.addCase(createNote.fulfilled, noteDoneEditing);
    builder.addCase(createNote.rejected, noteDoneEditing);
  },
});

export default uiSlice.reducer;
