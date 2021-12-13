// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//

/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { Draft } from 'immer';

import { getNotes } from 'features/notes/list/api';

import { User } from 'data/types';

import { getCurrentUser, prefix, signInUser, signOutUser, signUpUser } from './api';

export interface UserState {
  isSignedIn: boolean;
  user: User | null;
}

const initialState: UserState = {
  isSignedIn: false,
  user: null,
};

export const userSlice = createSlice({
  name: prefix,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const setSignedIn = (state: Draft<UserState>, { payload }: { payload: User }) => {
      state.isSignedIn = true;
      state.user = payload;
    };
    const setSignedOut = (state: Draft<UserState>) => {
      state.isSignedIn = false;
      state.user = null;
    };

    builder
      .addCase(getCurrentUser.fulfilled, (state, { payload }) => {
        if (payload === null) {
          setSignedOut(state);
        } else {
          setSignedIn(state, { payload });
        }
      })
      .addCase(signInUser.fulfilled, setSignedIn)
      .addCase(signUpUser.fulfilled, setSignedIn)

      .addCase(getCurrentUser.rejected, setSignedOut)
      .addCase(signInUser.rejected, setSignedOut)
      .addCase(signOutUser.fulfilled, setSignedOut)
      .addCase(signOutUser.rejected, setSignedOut)
      .addCase(signUpUser.rejected, setSignedOut)
      .addCase(getNotes.rejected, setSignedOut);
  },
});

export default userSlice.reducer;
