// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//

/* eslint-disable no-param-reassign */
import { AsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { prefix as notePrefix } from 'features/notes/list/api';
import { prefix as userPrefix } from 'features/user/api';

import { ErrorData } from 'data/types';

export interface ErrorState {
  any: ErrorData | null;
  [notePrefix]?: ErrorData;
  [userPrefix]?: ErrorData;
}

const initialState: ErrorState = { any: null };

type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>;
type RejectedAction = ReturnType<GenericAsyncThunk['rejected']>;

export const prefix = 'errorTracking';

export const errorTrackingSlice = createSlice({
  name: prefix,
  initialState,
  reducers: {
    clearLastError(state, { payload = 'any' }: PayloadAction<keyof ErrorState | undefined>) {
      if (payload === 'any') {
        state.any = null;
      } else if (payload) {
        delete state[payload];
      }
    },
  },
  extraReducers: (builder) => {
    // Tracking lastError
    builder.addMatcher(
      (action): action is RejectedAction => action?.type?.endsWith('/rejected'),
      (state, action) => {
        const [slice, ..._] = action.type.split('/', 2);
        state.any = action.payload as ErrorData;
        if (slice === userPrefix || slice === notePrefix) {
          state[slice] = action.payload as ErrorData;
        }
      },
    );
  },
});

export const { clearLastError } = errorTrackingSlice.actions;
export default errorTrackingSlice.reducer;
