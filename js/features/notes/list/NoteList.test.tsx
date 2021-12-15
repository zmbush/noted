// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import * as React from 'react';

import { createStore } from 'features/redux/store';
import { signInUser } from 'features/user/api';

import { render } from 'components/test-utils';

import NoteList from './NoteList';

describe('<NoteList />', () => {
  test('matches snapshot', async () => {
    const store = createStore();
    await store.dispatch(signInUser({ email: 'test@test.com', password: 'pass' }));
    expect(store.getState().notes.ids).toHaveLength(4);
    const { getByText } = render(<NoteList noteViewFilter={null} parent_note_id={0} depth={1} />, {
      store,
    });

    const notes = store.getState().notes.entities;
    expect(getByText(notes[1]!.title)).toMatchInlineSnapshot(`
      <span
        class="MuiTypography-root MuiTypography-h1 MuiCardHeader-title css-1krpg4r-MuiTypography-root"
      >
        Note 1
      </span>
    `);
    expect(getByText(notes[2]!.title)).toMatchInlineSnapshot(`
      <span
        class="MuiTypography-root MuiTypography-h1 MuiCardHeader-title css-1krpg4r-MuiTypography-root"
      >
        Note 2
      </span>
    `);
    expect(getByText(notes[3]!.title)).toMatchInlineSnapshot(`
      <span
        class="MuiTypography-root MuiTypography-h1 MuiCardHeader-title css-1krpg4r-MuiTypography-root"
      >
        Note 3
      </span>
    `);
    expect(getByText(notes[4]!.title)).toMatchInlineSnapshot(`
      <span
        class="MuiTypography-root MuiTypography-h1 MuiCardHeader-title css-1krpg4r-MuiTypography-root"
      >
        Note 4
      </span>
    `);
  });
});
