// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import * as React from 'react';
import { Route, Routes } from 'react-router-dom';

import { render } from 'components/test-utils';
import { signInUser } from 'data/user/api';

import FilteredNoteList from '../FilteredNoteList';

describe('<FilteredNoteList />', () => {
  test('matches snapshot', async () => {
    const { store, container, findByText, history } = render(
      <Routes>
        <Route path='/note/:ids' element={<FilteredNoteList depth={1} search='' />} />
      </Routes>,
      {
        route: '/note/1',
      },
    );

    expect(container).toMatchInlineSnapshot(`<div />`);

    await store.dispatch(signInUser({ email: 'test@test.com', password: 'pass' }));

    // Should be showing note 1 by default.
    const note1 = store.getState().notes.entities[1];
    await findByText(note1.title);
    await findByText(note1.body);

    // Navigate to /note/2
    history.replace('/note/2');
    const note2 = store.getState().notes.entities[2];
    await findByText(note2.title);
    await findByText(note2.body);
  });
});
