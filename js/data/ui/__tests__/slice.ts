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
      noteChanging: {},
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
      noteChanging: {},
    });

    state = ui(state, { type: 'fake/event/pending', meta: { requestId: 'two' } });
    expect(state).toEqual({
      inProgress: {
        fake: { event: ['one', 'two'] },
      },
      lastError: null,
      noteChanging: {},
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
      noteChanging: {},
    });

    state = ui(state, { type: 'fake/event/fulfilled', meta: { requestId: 'two' } });
    expect(state).toEqual({
      inProgress: {},
      lastError: 'an error',
      noteChanging: {},
    });

    state = ui(state, clearLastError());
    expect(state).toEqual({
      inProgress: {},
      lastError: null,
      noteChanging: {},
    });
  });

  test('tracks note loading events', () => {
    let state = getInitial();
    state = ui(state, { type: 'notes/update/pending', meta: { requestId: 'noId', arg: {} } });
    expect(state.noteChanging).toEqual({});

    state = ui(state, { type: 'notes/update/rejected', meta: { requestId: 'noId', arg: {} } });
    expect(state.noteChanging).toEqual({});

    state = ui(state, { type: 'notes/update/pending', meta: { requestId: 'id', arg: { id: 10 } } });
    expect(state.noteChanging).toEqual({ 10: ['id'] });

    state = ui(state, {
      type: 'notes/update/pending',
      meta: { requestId: 'parent_note_id', arg: { parent_note_id: 11 } },
    });
    expect(state.noteChanging).toEqual({ 10: ['id'], 11: ['parent_note_id'] });

    state = ui(state, {
      type: 'notes/update/fulfilled',
      meta: { requestId: 'id', arg: { id: 10 } },
    });
    expect(state.noteChanging).toEqual({ 11: ['parent_note_id'] });

    state = ui(state, {
      type: 'notes/update/fulfilled',
      meta: { requestId: 'parent_note_id', arg: { parent_note_id: 11 } },
    });
    expect(state.noteChanging).toEqual({});
  });
});
