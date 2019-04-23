// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import { NotedEvent } from 'data/actions';
import { UserData, ErrorData } from 'data/types';
import update from 'immutability-helper';

const initialState = { is_signed_in: false, user: null as (null | UserData) };

type State = typeof initialState;

export default function user(
  state = initialState,
  action: {
    type?: NotedEvent;
    error?: ErrorData;
    is_signed_in?: boolean;
    user?: UserData;
  }
): State {
  switch (action.type) {
    case NotedEvent.ApiError: {
      if (action.error.code == 401) {
        return initialState;
      }
    }
    case NotedEvent.UserSignedIn: {
      return update(state, {
        is_signed_in: { $set: true },
        user: { $set: action.user },
      });
    }
    case NotedEvent.UserSignedOut: {
      return initialState;
    }
  }
  return state;
}
