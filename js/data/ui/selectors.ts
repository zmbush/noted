// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { createSelector } from 'reselect';

import { prefix as notesPrefix } from 'data/notes/api';
import { AppState } from 'data/store';
import { prefix as uiPrefix } from 'data/ui/slice';
import { prefix as userPrefix } from 'data/user/api';

const getUi = (state: AppState) => state[uiPrefix];

export const getUserLoading = createSelector(getUi, (ui) => userPrefix in ui.inProgress);
export const getNotesLoading = createSelector(getUi, (ui) => notesPrefix in ui.inProgress);
export const getLastError = createSelector(getUi, (ui) => ui.lastError);
