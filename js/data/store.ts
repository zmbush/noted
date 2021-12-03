// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { combineReducers, configureStore } from '@reduxjs/toolkit';

import notes from 'data/notes/slice';
import user from 'data/user/slice';

export const rootReducer = combineReducers({ user, notes });
export const store = configureStore({
  reducer: rootReducer,
  devTools: true,
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
