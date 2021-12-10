// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//

/* eslint-disable no-param-reassign */
import { AsyncThunk, createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';

import { updateNote, createNote, prefix as notePrefix } from 'data/notes/api';
import { ErrorData } from 'data/types';
import { prefix as userPrefix } from 'data/user/api';

export interface UIState {
  lastError: {
    any: ErrorData | null;
    [notePrefix]?: ErrorData;
    [userPrefix]?: ErrorData;
  };
  inProgress: { [slice: string]: { [type: string]: string[] } };
  noteChanging: { [note_id: number]: string[] };
  firstNote: number | null;
  editingNote: 'new' | number | null;
}

const initialState: UIState = {
  lastError: { any: null },
  inProgress: {},
  noteChanging: {},
  firstNote: null,
  editingNote: null,
};

type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>;
type PendingAction = ReturnType<GenericAsyncThunk['pending']>;
type RejectedAction = ReturnType<GenericAsyncThunk['rejected']>;
type FulfilledAction = ReturnType<GenericAsyncThunk['fulfilled']>;

const ensureInProgress = (state: UIState, slice: string, type: string) => {
  if (!(slice in state.inProgress)) {
    state.inProgress[slice] = {};
  }
  if (!(type in state.inProgress[slice])) {
    state.inProgress[slice][type] = [];
  }
};

export const prefix = 'ui';

export const uiSlice = createSlice({
  name: prefix,
  initialState,
  reducers: {
    setFirstNote(state, { payload }: PayloadAction<number | null>) {
      state.firstNote = payload;
    },
    setEditingNote(state, { payload }: PayloadAction<'new' | number | null>) {
      state.editingNote = payload;
    },
    clearLastError(
      state,
      { payload = 'any' }: PayloadAction<keyof UIState['lastError'] | undefined>,
    ) {
      if (payload === 'any') {
        state.lastError.any = null;
      } else if (payload) {
        delete state.lastError[payload];
      }
    },
  },
  extraReducers: (builder) => {
    const noteStartEditing = <
      V,
      Ty extends string,
      T extends { id: number } | { parent_note_id?: number | null },
    >(
      state: Draft<UIState>,
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
      state.noteChanging[id] = [
        ...new Set([...(state.noteChanging[id] || []), action.meta.requestId]),
      ];
    };

    const noteDoneEditing = <
      V,
      Ty extends string,
      T extends { id: number } | { parent_note_id?: number | null },
    >(
      state: Draft<UIState>,
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
      const changing = new Set(state.noteChanging[id] || []);
      changing.delete(action.meta.requestId);
      if (changing.size > 0) {
        state.noteChanging[id] = [...changing];
      } else {
        delete state.noteChanging[id];
      }
    };
    builder.addCase(updateNote.pending, noteStartEditing);
    builder.addCase(createNote.pending, noteStartEditing);

    builder.addCase(updateNote.fulfilled, noteDoneEditing);
    builder.addCase(updateNote.rejected, noteDoneEditing);
    builder.addCase(createNote.fulfilled, noteDoneEditing);
    builder.addCase(createNote.rejected, noteDoneEditing);
    // Tracking lastError
    builder
      .addMatcher(
        (action): action is RejectedAction => action?.type?.endsWith('/rejected'),
        (state, action) => {
          const [slice, ..._] = action.type.split('/', 2);
          state.lastError.any = action.payload as ErrorData;
          if (slice === userPrefix || slice === notePrefix) {
            state.lastError[slice] = action.payload as ErrorData;
          }
        },
      )

      // Tracking inProgress.
      .addMatcher(
        (action): action is PendingAction => action?.type?.endsWith('/pending'),
        (state, action) => {
          const [slice, type, ..._] = action.type.split('/', 3);
          ensureInProgress(state, slice, type);
          state.inProgress[slice][type] = [
            ...new Set([...state.inProgress[slice][type], action.meta.requestId]),
          ];
        },
      )
      .addMatcher(
        (action): action is FulfilledAction | RejectedAction =>
          action?.type?.endsWith('/fulfilled') || action?.type?.endsWith('/rejected'),
        (state, action) => {
          const [slice, type, ..._] = action.type.split('/', 3);
          ensureInProgress(state, slice, type);
          const inProgress = new Set(state.inProgress[slice][type]);
          inProgress.delete(action.meta.requestId);

          if (inProgress.size > 0) {
            state.inProgress[slice][type] = [...inProgress];
          } else {
            delete state.inProgress[slice][type];
          }

          if (Object.entries(state.inProgress[slice]).length === 0) {
            delete state.inProgress[slice];
          }
        },
      );
  },
});

export const { clearLastError, setEditingNote, setFirstNote } = uiSlice.actions;
export default uiSlice.reducer;
