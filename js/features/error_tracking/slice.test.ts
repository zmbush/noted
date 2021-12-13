// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import ui, { clearLastError } from './slice';

describe('error_tracking::slice()', () => {
  const getInitial = () => ui(undefined, { type: '' });

  test('returns initial state', () => {
    expect(getInitial()).toEqual({ any: null });
  });

  test('responds to arbitrary events', () => {
    let state = getInitial();

    state = ui(state, { type: 'fake/event/pending', meta: { requestId: 'one' } });
    expect(state.any).toBeNull();

    state = ui(state, { type: 'fake/event/pending', meta: { requestId: 'two' } });
    expect(state.any).toBeNull();

    state = ui(state, {
      type: 'fake/event/rejected',
      meta: { requestId: 'one' },
      payload: 'an error',
    });
    expect(state.any).toEqual('an error');

    state = ui(state, { type: 'fake/event/fulfilled', meta: { requestId: 'two' } });
    expect(state.any).toEqual('an error');

    state = ui(state, clearLastError());
    expect(state.any).toBeNull();
  });
});
