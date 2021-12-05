// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import ui, { clearLastError } from '../slice';

describe('ui::slice()', () => {
  const getInitial = () => ui(undefined, { type: '' });

  test('returns initial state', () => {
    expect(getInitial()).toEqual({
      inProgress: {},
      lastError: null,
    });
  });

  test('responds to arbitrary events', () => {
    let state = getInitial();

    state = ui(state, { type: 'fake/event/pending', meta: { requestId: 'one' } });
    expect(state).toEqual({
      inProgress: {
        fake: { event: ['one'] },
      },
      lastError: null,
    });

    state = ui(state, { type: 'fake/event/pending', meta: { requestId: 'two' } });
    expect(state).toEqual({
      inProgress: {
        fake: { event: ['one', 'two'] },
      },
      lastError: null,
    });

    state = ui(state, {
      type: 'fake/event/rejected',
      meta: { requestId: 'one' },
      payload: 'an error',
    });
    expect(state).toEqual({
      inProgress: {
        fake: { event: ['two'] },
      },
      lastError: 'an error',
    });

    state = ui(state, { type: 'fake/event/fulfilled', meta: { requestId: 'two' } });
    expect(state).toEqual({
      inProgress: {},
      lastError: 'an error',
    });

    state = ui(state, clearLastError());
    expect(state).toEqual({
      inProgress: {},
      lastError: null,
    });
  });
});
