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

export interface RequestTrackingState {
  inProgress: { [slice: string]: { [type: string]: string[] } };
}

const initialState: RequestTrackingState = {
  inProgress: {},
};

type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>;
type PendingAction = ReturnType<GenericAsyncThunk['pending']>;
type RejectedAction = ReturnType<GenericAsyncThunk['rejected']>;
type FulfilledAction = ReturnType<GenericAsyncThunk['fulfilled']>;

const ensureInProgress = (state: RequestTrackingState, slice: string, type: string) => {
  if (!(slice in state.inProgress)) {
    state.inProgress[slice] = {};
  }
  if (!(type in state.inProgress[slice])) {
    state.inProgress[slice][type] = [];
  }
};

export const prefix = 'requestTracking';

export const requestTrackingSlice = createSlice({
  name: prefix,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Tracking inProgress.
    builder
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

export default requestTrackingSlice.reducer;
