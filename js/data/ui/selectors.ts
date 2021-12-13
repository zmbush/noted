// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import createCachedSelector from 're-reselect';
import { createSelector } from 'reselect';

import { prefix as notesPrefix } from 'data/notes/api';
import { AppState } from 'data/store';
import { prefix as userPrefix } from 'data/user/api';

import { prefix as uiPrefix, UIState } from './slice';

const getUi = (state: AppState): UIState => state[uiPrefix];
const noteId = (_: AppState, { id }: { id: number }) => id;
const sliceSelector = (
  _: AppState,
  { slice }: { slice: 'any' | typeof notesPrefix | typeof userPrefix } = { slice: 'any' },
) => slice;

export const getUserLoading = createSelector(getUi, (ui) => userPrefix in ui.inProgress);
export const getNotesLoading = createSelector(getUi, (ui) => notesPrefix in ui.inProgress);
export const getIsNoteChanging = createCachedSelector(
  getUi,
  noteId,
  (uiState, id) => !!uiState.noteChanging[id],
)((_, { id }) => id);

export const getLastError = createSelector(
  getUi,
  sliceSelector,
  (ui, slice) => ui.lastError[slice],
);

export const getEditingNote = createSelector(getUi, (ui) => ui.editingNote);
