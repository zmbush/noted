// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { NotedEvent } from 'data/actions';
import { NoteWithTags, ErrorData } from 'data/types';

const initialState = new Map<number, NoteWithTags>();
type State = typeof initialState;

export default function notes(
  // eslint-disable-next-line default-param-last
  state = initialState,
  action: {
    type?: NotedEvent;
    notes?: NoteWithTags[];
    note?: NoteWithTags;
    error?: ErrorData;
    id?: number;
  },
): State {
  switch (action.type) {
    case NotedEvent.NotesFetched: {
      const data = new Map();
      action.notes.forEach((note) => data.set(note.id, note));
      return data;
    }
    case NotedEvent.NotesUpdateNote: {
      const data = new Map(state);
      data.set(action.note.id, action.note);
      return data;
    }
    case NotedEvent.NotesDeleteNote: {
      const data = new Map(state);
      data.delete(action.id);
      return data;
    }
    case NotedEvent.ApiError: {
      if (action.error.code === 401) {
        return new Map();
      }
      return state;
    }
    case NotedEvent.UserSignedOut: {
      return new Map();
    }
    default:
      return state;
  }
}
