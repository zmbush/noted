// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//

/* eslint-disable no-param-reassign */
import { AsyncThunk, createSlice } from '@reduxjs/toolkit';

import { ErrorData } from 'data/types';

export type UIState = {
  lastError: ErrorData | null;
  inProgress: string[];
};
const initialState: UIState = {
  lastError: null,
  inProgress: [],
};

type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>;
type PendingAction = ReturnType<GenericAsyncThunk['pending']>;
type RejectedAction = ReturnType<GenericAsyncThunk['rejected']>;
type FulfilledAction = ReturnType<GenericAsyncThunk['fulfilled']>;

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    clearLastError(state) {
      state.lastError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Tracking lastError
      .addMatcher(
        (action): action is RejectedAction => action?.type?.endsWith('/rejected'),
        (state, action) => {
          state.lastError = action.payload as ErrorData;
        },
      )

      // Tracking inProgress.
      .addMatcher(
        (action): action is PendingAction => action?.type?.endsWith('/pending'),
        (state, action) => {
          state.inProgress = [...new Set([...state.inProgress, action.meta.requestId])];
        },
      )
      .addMatcher(
        (action): action is FulfilledAction | RejectedAction =>
          action?.type?.endsWith('/fulfilled') || action?.type?.endsWith('/rejected'),
        (state, action) => {
          const inProgress = new Set(state.inProgress);
          inProgress.delete(action.meta.requestId);
          state.inProgress = [...inProgress];
        },
      );
  },
});

export const { clearLastError } = uiSlice.actions;
export default uiSlice.reducer;
