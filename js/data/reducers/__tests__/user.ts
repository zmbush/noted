// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
import { logIn, signOut, apiError } from 'data/actions';

import user from '../user';

describe('reducers::user()', () => {
  const getInitial = () => user(undefined, {});

  test('returns initial state', () => {
    expect(getInitial()).toEqual({ is_signed_in: false, user: null });
  });

  test('responds to events', () => {
    let state = getInitial();
    const u = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      created_at: '',
      updated_at: '',
    };
    state = user(state, logIn(u));

    expect(state).toMatchSnapshot();
    expect(user(state, signOut())).toMatchSnapshot();
    expect(user(state, apiError({ code: 401, error: '' }))).toMatchSnapshot();
  });
});
