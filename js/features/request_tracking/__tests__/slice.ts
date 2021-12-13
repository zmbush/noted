// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import requestTracking from '../slice';

describe('requestTracking::slice()', () => {
  const getInitial = () => requestTracking(undefined, { type: '' });

  test('returns initial state', () => {
    expect(getInitial()).toEqual({
      inProgress: {},
    });
  });

  test('responds to arbitrary events', () => {
    let state = getInitial();

    state = requestTracking(state, { type: 'fake/event/pending', meta: { requestId: 'one' } });
    expect(state.inProgress).toEqual({ fake: { event: ['one'] } });

    state = requestTracking(state, { type: 'fake/event/pending', meta: { requestId: 'two' } });
    expect(state.inProgress).toEqual({ fake: { event: ['one', 'two'] } });

    state = requestTracking(state, {
      type: 'fake/event/rejected',
      meta: { requestId: 'one' },
      payload: 'an error',
    });
    expect(state.inProgress).toEqual({ fake: { event: ['two'] } });

    state = requestTracking(state, { type: 'fake/event/fulfilled', meta: { requestId: 'two' } });
    expect(state.inProgress).toEqual({});
  });
});
