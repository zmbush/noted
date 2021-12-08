// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import userEvent from '@testing-library/user-event';

import * as React from 'react';

import { render, waitFor } from 'components/test-utils';
import { signInUser } from 'data/user/api';

import Pages from './Pages';

describe('<Pages />', () => {
  test('interactions work', async () => {
    const { store, container, findByText, queryByText, findAllByTestId, history } = render(
      <Pages createFromSearch={() => {}} search='' />,
      {
        route: '/note/1',
      },
    );

    expect(container).toMatchInlineSnapshot(`<div />`);

    await store.dispatch(signInUser({ email: 'test@test.com', password: 'pass' }));

    const note1 = store.getState().notes.entities[1]!;
    const note2 = store.getState().notes.entities[2]!;
    const note3 = store.getState().notes.entities[3]!;
    const note4 = store.getState().notes.entities[4]!;

    // Should be showing note 1 by default.
    await findByText(note1.title);
    await findByText(note1.body);

    // Navigate to /note/2
    history.replace('/note/2');
    await findByText(note2.title);
    await findByText(note2.body);

    // Ensure disambiguation works.
    history.replace('/disambiguation/3,4');
    await findByText(note3.title);
    await findByText(note4.title);

    // Archive should be empty.
    history.replace('/archive');
    expect(queryByText(note1.title)).toBeNull();
    expect(queryByText(note2.title)).toBeNull();
    expect(queryByText(note3.title)).toBeNull();
    expect(queryByText(note4.title)).toBeNull();

    // Go back to index, archive the first note.
    history.replace('/');
    userEvent.click((await findAllByTestId('MoreVertIcon'))[0]);
    userEvent.click(await findByText('Archive Note'));
    await waitFor(() => expect(queryByText(note1.title)).toBeNull());

    // Note 1 should now show up in the archive.
    history.replace('/archive');
    await findByText(note1.title);
  });
});
