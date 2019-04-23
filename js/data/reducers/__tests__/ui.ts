// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import { notesFetchStart, notesFetched, apiError } from 'data/actions';
import ui from '../ui';

describe('reducers::ui()', () => {
  const getInitial = () => ui(undefined, {});

  test('works with null state', () => {
    expect(getInitial()).toEqual({
      loading_notes: false,
    });
  });

  test('responds to events', () => {
    let state = getInitial();
    state = ui(state, notesFetchStart());
    expect(state).toEqual({ loading_notes: true });
    expect(ui(state, notesFetched([]))).toEqual({ loading_notes: false });
    expect(ui(state, apiError({ code: 401, error: '' }))).toEqual({
      loading_notes: false,
    });
  });
});
