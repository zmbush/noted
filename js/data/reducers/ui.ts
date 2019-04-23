// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import { NotedEvent } from 'data/actions';
import update from 'immutability-helper';

const initialState = { loading_notes: false };

type State = typeof initialState;

export default function ui(
  state = initialState,
  action: { type?: NotedEvent }
): State {
  switch (action.type) {
    case NotedEvent.NotesFetchStart: {
      return update(state, { loading_notes: { $set: true } });
    }
    case NotedEvent.NotesFetched:
    case NotedEvent.ApiError: {
      return update(state, { loading_notes: { $set: false } });
    }
  }
  return state;
}
