// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import { combineReducers } from 'redux';
import { NotedEvent } from 'data/actions';

function notes(
  state = new Map<number, any>(),
  action: { type: NotedEvent; notes?: any[]; note?: any }
) {
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
    default:
      return state;
  }
}

export default combineReducers({ notes });
