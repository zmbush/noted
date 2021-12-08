// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import api from 'api';
import { store } from 'data/store';

import * as userApi from '../api';

const testUser = {
  id: 0,
  name: 'Test User',
  email: 'test@test.com',
  created_at: '',
  updated_at: '',
};

// Log in actions call list on success. We aren't testing that here, so just mock it out.
jest.spyOn(api.note, 'list').mockResolvedValue([]);

describe('getCurrentUser', () => {
  it('handles success well', async () => {
    jest.spyOn(api.user, 'get').mockResolvedValueOnce(testUser);
    await store.dispatch(userApi.getCurrentUser());
    expect(store.getState().user.isSignedIn).toBeTruthy();
    expect(store.getState().user.user).toEqual(testUser);
  });

  it('handles failure well', async () => {
    jest.spyOn(api.user, 'get').mockRejectedValueOnce({ code: 401, error: 'NotLoggedIn' });
    await store.dispatch(userApi.getCurrentUser());
    expect(store.getState().user.isSignedIn).toBeFalsy();
    expect(store.getState().user.user).toBeNull();
    expect(store.getState().ui.lastError.any?.code).toEqual(401);
  });
});

describe('signInUser', () => {
  it('handles success well', async () => {
    jest.spyOn(api.user, 'signIn').mockResolvedValueOnce(testUser);
    await store.dispatch(userApi.signInUser({ email: 'test@test.com', password: 'pass' }));
    expect(store.getState().user.isSignedIn).toBeTruthy();
    expect(store.getState().user.user).toEqual(testUser);
  });

  it('handles failure well', async () => {
    jest.spyOn(api.user, 'signIn').mockRejectedValueOnce({ code: 401, error: 'NotLoggedIn' });
    await store.dispatch(userApi.signInUser({ email: 'test@test.com', password: 'pass' }));
    expect(store.getState().user.isSignedIn).toBeFalsy();
    expect(store.getState().user.user).toBeNull();
    expect(store.getState().ui.lastError.any?.code).toEqual(401);
  });
});

describe('signUpUser', () => {
  it('handles success well', async () => {
    jest.spyOn(api.user, 'signUp').mockResolvedValueOnce(testUser);
    await store.dispatch(
      userApi.signUpUser({ name: 'Test User', email: 'test@test.com', password: 'pass' }),
    );
    expect(store.getState().user.isSignedIn).toBeTruthy();
    expect(store.getState().user.user).toEqual(testUser);
  });

  it('handles failure well', async () => {
    jest.spyOn(api.user, 'signUp').mockRejectedValueOnce({ code: 401, error: 'NotLoggedIn' });
    await store.dispatch(
      userApi.signUpUser({ name: 'Test User', email: 'test@test.com', password: 'pass' }),
    );
    expect(store.getState().user.isSignedIn).toBeFalsy();
    expect(store.getState().user.user).toBeNull();
    expect(store.getState().ui.lastError.any?.code).toEqual(401);
  });
});

describe('signOutUser', () => {
  it('handles success well', async () => {
    jest.spyOn(api.user, 'signIn').mockResolvedValueOnce(testUser);
    jest.spyOn(api.user, 'signOut').mockResolvedValueOnce();
    await store.dispatch(userApi.signInUser({ email: 'test@test.com', password: 'pass' }));
    expect(store.getState().user.isSignedIn).toBeTruthy();
    expect(store.getState().user.user).toEqual(testUser);

    await store.dispatch(userApi.signOutUser());
    expect(store.getState().user.isSignedIn).toBeFalsy();
    expect(store.getState().user.user).toBeNull();
  });

  it('handles failure well', async () => {
    jest.spyOn(api.user, 'signIn').mockResolvedValueOnce(testUser);
    jest.spyOn(api.user, 'signOut').mockRejectedValueOnce({ code: 401, error: 'NotLoggedIn' });
    await store.dispatch(userApi.signInUser({ email: 'test@test.com', password: 'pass' }));
    expect(store.getState().user.isSignedIn).toBeTruthy();
    expect(store.getState().user.user).toEqual(testUser);

    await store.dispatch(userApi.signOutUser());
    expect(store.getState().user.isSignedIn).toBeFalsy();
    expect(store.getState().user.user).toBeNull();
    expect(store.getState().ui.lastError.any?.code).toEqual(401);
  });
});
