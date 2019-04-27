// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import { NotedEvent } from 'data/actions';
import { NoteData, ErrorData } from 'data/types';
import update from 'immutability-helper';

const initialState = new Map<number, NoteData>();
type State = typeof initialState;

export default function notes(
  state = initialState,
  action: {
    type?: NotedEvent;
    notes?: NoteData[];
    note?: NoteData;
    error?: ErrorData;
    id?: number;
  }
): State {
  switch (action.type) {
    case NotedEvent.NotesFetched: {
      let data = new Map();
      for (let note of action.notes) {
        data.set(note.id, note);
      }
      return data;
    }
    case NotedEvent.NotesUpdateNote: {
      let data = new Map(state);
      data.set(action.note.id, action.note);
      return data;
    }
    case NotedEvent.NotesDeleteNote: {
      let data = new Map(state);
      data.delete(action.id);
      return data;
    }
    case NotedEvent.ApiError: {
      if (action.error.code == 401) {
        return new Map();
      }
    }
    case NotedEvent.UserSignedOut: {
      return new Map();
    }
    default:
      return state;
  }
}
