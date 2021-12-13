// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { combineReducers, configureStore } from '@reduxjs/toolkit';

import errorTracking from 'features/error_tracking/slice';
import noteLoading from 'features/note_loading/slice';
import noteEdit from 'features/notes/edit/slice';
import notes from 'features/notes/list/slice';
import requestTracking from 'features/request_tracking/slice';
import user from 'features/user/slice';

export const rootReducer = combineReducers({
  errorTracking,
  noteEdit,
  noteLoading,
  notes,
  requestTracking,
  user,
});
export const createStore = () =>
  configureStore({
    reducer: rootReducer,
    devTools: true,
  });

export const store = createStore();

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
