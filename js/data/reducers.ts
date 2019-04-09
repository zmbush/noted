// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import { combineReducers } from 'redux';
import { NotedEvent } from 'data/actions';
import { NoteData, ErrorData, UserData } from 'data/types';
import update from 'immutability-helper';

type NoteState = Map<number, NoteData>;

function notes(
  state = new Map<number, NoteData>(),
  action: {
    type: NotedEvent;
    notes?: NoteData[];
    note?: NoteData;
    error: ErrorData;
  }
): NoteState {
  switch (action.type) {
    case NotedEvent.NOTES_FETCHED: {
      let data = new Map();
      for (let note of action.notes) {
        data.set(note.id, note);
      }
      return data;
    }
    case NotedEvent.NOTES_UPDATE_NOTE: {
      let data = new Map(state);
      data.set(action.note.id, action.note);
      return data;
    }
    case NotedEvent.API_ERROR: {
      if (action.error.code == 401) {
        return new Map();
      }
    }
    case NotedEvent.USER_SIGNED_OUT: {
      return new Map();
    }
    default:
      return state;
  }
}

const initialState = { is_signed_in: false, user: null as (null | UserData) };

type UserState = typeof initialState;

function user(
  state = initialState,
  action: {
    type: NotedEvent;
    error: ErrorData;
    is_signed_in: boolean;
    user: UserData;
  }
): UserState {
  switch (action.type) {
    case NotedEvent.API_ERROR: {
      if (action.error.code == 401) {
        return update(state, {
          is_signed_in: { $set: false },
          user: { $set: null },
        });
      }
    }
    case NotedEvent.USER_SIGNED_IN: {
      return update(state, {
        is_signed_in: { $set: true },
        user: { $set: action.user },
      });
    }
    case NotedEvent.USER_SIGNED_OUT: {
      return initialState;
    }
  }
  return state;
}

const rootReducer = combineReducers({ notes, user });

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;
