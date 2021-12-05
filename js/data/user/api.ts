// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { createAsyncThunk } from '@reduxjs/toolkit';

import api from 'api';
import { getNotes } from 'data/notes/api';
import { NewUserRequest, SignIn } from 'data/types';

export const getCurrentUser = createAsyncThunk(
  'users/getCurrentUser',
  async (_: void, { rejectWithValue, dispatch }) => {
    try {
      const user = await api.user.get();
      await dispatch(getNotes());
      return user;
    } catch (e) {
      throw rejectWithValue(e);
    }
  },
);

export const signInUser = createAsyncThunk(
  'user/signIn',
  async (signIn: SignIn, { rejectWithValue, dispatch }) => {
    try {
      const user = await api.user.signIn(signIn);
      await dispatch(getNotes());
      return user;
    } catch (e) {
      throw rejectWithValue(e);
    }
  },
);

export const signUpUser = createAsyncThunk(
  'user/signUp',
  async (signUp: NewUserRequest, { rejectWithValue, dispatch }) => {
    try {
      const user = await api.user.signUp(signUp);
      await dispatch(getNotes());
      return user;
    } catch (e) {
      throw rejectWithValue(e);
    }
  },
);

export const signOutUser = createAsyncThunk(
  'user/signOut',
  async (_: void, { rejectWithValue }) => {
    try {
      await api.user.signOut();
    } catch (e) {
      throw rejectWithValue(e);
    }
  },
);
