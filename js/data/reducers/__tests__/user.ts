// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import user from '../user';
import { NotedEvent } from 'data/actions';
import { NoteData } from 'data/types';

describe('reducers::user()', () => {
  let id = 1;
  const getInitial = () => user(undefined, {});

  test('returns initial state', () => {
    expect(getInitial()).toEqual({ is_signed_in: false, user: null });
  });

  test('responds to events', () => {
    let state = getInitial();
    let u = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      created_at: '',
      updated_at: '',
    };
    state = user(state, { type: NotedEvent.UserSignedIn, user: u });

    expect(state).toMatchSnapshot();
    expect(user(state, { type: NotedEvent.UserSignedOut })).toMatchSnapshot();
    expect(
      user(state, {
        type: NotedEvent.ApiError,
        error: { code: 401, error: '' },
      })
    ).toMatchSnapshot();
  });
});
