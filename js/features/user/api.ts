// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { createAsyncThunk } from '@reduxjs/toolkit';

import { getNotes } from 'features/notes/list/api';

import api from 'data/api';
import { NewUserPayload, SignInPayload } from 'data/types';

export const prefix = 'user';
const name = (n: string) => `${prefix}/${n}`;

export const getCurrentUser = createAsyncThunk(
  name('get'),
  async (_: void, { rejectWithValue, dispatch }) => {
    try {
      const user = await api.user.get();
      if ('id' in user) {
        await dispatch(getNotes());
        return user;
      }
      return null;
    } catch (e) {
      throw rejectWithValue(e);
    }
  },
);

export const signInUser = createAsyncThunk(
  name('signIn'),
  async (signIn: SignInPayload, { rejectWithValue, dispatch }) => {
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
  name('signUp'),
  async (signUp: NewUserPayload, { rejectWithValue, dispatch }) => {
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
  name('signOut'),
  async (_: void, { rejectWithValue }) => {
    try {
      await api.user.signOut();
    } catch (e) {
      throw rejectWithValue(e);
    }
  },
);
