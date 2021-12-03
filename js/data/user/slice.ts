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
import { WritableDraft } from 'immer/dist/types/types-external';

import { User } from 'data/types';
import { getCurrentUser, signInUser, signOutUser, signUpUser } from 'data/user/api';

export interface UserState {
  isSignedIn: boolean;
  user: User | null;
}

const initialState: UserState = {
  isSignedIn: false,
  user: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const setSignedIn = (state: WritableDraft<UserState>, { payload }: { payload: User }) => {
      state.isSignedIn = true;
      state.user = payload;
    };
    const setSignedOut = (state: WritableDraft<UserState>) => {
      state.isSignedIn = false;
      state.user = null;
    };

    builder
      .addCase(getCurrentUser.fulfilled, setSignedIn)
      .addCase(signInUser.fulfilled, setSignedIn)
      .addCase(signUpUser.fulfilled, setSignedIn)

      .addCase(getCurrentUser.rejected, setSignedOut)
      .addCase(signInUser.rejected, setSignedOut)
      .addCase(signOutUser.fulfilled, setSignedOut)
      .addCase(signOutUser.rejected, setSignedOut)
      .addCase(signUpUser.rejected, setSignedOut);
  },
});

export default userSlice.reducer;
