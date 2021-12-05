// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import * as React from 'react';

import { render } from 'components/test-utils';
import { createNote } from 'data/notes/api';
import { createStore } from 'data/store';
import { signInUser } from 'data/user/api';

import NoteList from '../NoteList';

describe('<NoteList />', () => {
  test('matches snapshot', async () => {
    const store = createStore();
    await store.dispatch(signInUser({ email: 'test@test.com', password: 'pass' }));
    expect(store.getState().notes.ids).toHaveLength(4);
    const { getByText } = render(
      <NoteList parent_note_id={0} depth={1} notes={store.getState().notes.entities} search='' />,
      { store },
    );

    const notes = store.getState().notes.entities;
    expect(getByText(notes[1].title)).toMatchInlineSnapshot(`
      <span
        class="MuiTypography-root MuiTypography-h5 MuiCardHeader-title css-1qvr50w-MuiTypography-root"
      >
        Note 1
      </span>
    `);
    expect(getByText(notes[2].title)).toMatchInlineSnapshot(`
      <span
        class="MuiTypography-root MuiTypography-h5 MuiCardHeader-title css-1qvr50w-MuiTypography-root"
      >
        Note 2
      </span>
    `);
    expect(getByText(notes[3].title)).toMatchInlineSnapshot(`
      <span
        class="MuiTypography-root MuiTypography-h5 MuiCardHeader-title css-1qvr50w-MuiTypography-root"
      >
        Note 3
      </span>
    `);
    expect(getByText(notes[4].title)).toMatchInlineSnapshot(`
      <span
        class="MuiTypography-root MuiTypography-h5 MuiCardHeader-title css-1qvr50w-MuiTypography-root"
      >
        Note 4
      </span>
    `);
  });

  test('matches second snapshot', async () => {
    const store = createStore();
    await store.dispatch(signInUser({ email: 'test@test.com', password: 'pass' }));
    await store.dispatch(
      createNote({ title: 'Something Different', body: '', parent_note_id: 3, tags: [] }),
    );
    expect(store.getState().notes.ids).toHaveLength(5);
    const { getByText, queryByText } = render(
      <NoteList
        parent_note_id={0}
        depth={1}
        notes={store.getState().notes.entities}
        search='Something Different'
      />,
      { store },
    );

    const notes = store.getState().notes.entities;
    expect(queryByText(notes[1].title)).toBeNull();
    expect(queryByText(notes[2].title)).toBeNull();
    // 3 is a parent of 5, and should be rendered even if the search doesn't match.
    expect(getByText(notes[3].title)).toMatchInlineSnapshot(`
      <span
        class="MuiTypography-root MuiTypography-h5 MuiCardHeader-title css-1qvr50w-MuiTypography-root"
      >
        Note 3
      </span>
    `);
    expect(queryByText(notes[4].title)).toBeNull();
    expect(getByText(notes[5].title)).toMatchInlineSnapshot(`
      <span
        class="MuiTypography-root MuiTypography-h5 MuiCardHeader-title css-1qvr50w-MuiTypography-root"
      >
        Something Different
      </span>
    `);
  });
});
