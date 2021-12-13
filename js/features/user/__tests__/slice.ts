// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { getCurrentUser, signInUser, signOutUser } from '../api';
import user from '../slice';

describe('reducers::user()', () => {
  const getInitial = () => user(undefined, getCurrentUser.rejected({ name: '', message: '' }, ''));

  test('returns initial state', () => {
    expect(getInitial()).toEqual({ isSignedIn: false, user: null });
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
    state = user(state, signInUser.fulfilled(u, '', { email: '', password: '' }));

    expect(state).toMatchSnapshot();
    expect(user(state, signOutUser.fulfilled(undefined, '', undefined))).toMatchSnapshot();
  });
});
