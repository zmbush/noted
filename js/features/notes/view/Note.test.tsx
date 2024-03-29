// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
import userEvent from '@testing-library/user-event';

import * as React from 'react';

import { createStore } from 'features/redux/store';
import { signInUser } from 'features/user/api';

import { render, waitForElementToBeRemoved } from 'components/test-utils';

import Note from './Note';

describe('<Note />', () => {
  test('allows pinning and archiving', async () => {
    const store = createStore();
    await store.dispatch(signInUser({ email: 'test@test.com', password: 'pass' }));
    expect(store.getState().notes.entities[1]).toMatchInlineSnapshot(`
      Object {
        "archived": false,
        "body": "The Body",
        "created_at": "",
        "id": 1,
        "parent_note_id": 0,
        "pinned": false,
        "tags": Array [
          "tag1",
        ],
        "title": "Note 1",
        "updated_at": "",
        "user_id": 1,
      }
    `);
    const { rerender, findByTestId, findByText, queryByText } = render(
      <Note note={store.getState().notes.entities[1]!} />,
      { store },
    );

    const clickMenu = async (menuItem: string) => {
      userEvent.click(await findByTestId('MoreVertIcon'));
      userEvent.click(await findByText(menuItem));
      await waitForElementToBeRemoved(() => queryByText(menuItem));
    };

    await clickMenu('Archive Note');

    expect(store.getState().notes.entities[1]!.archived).toBeTruthy();
    rerender(<Note note={store.getState().notes.entities[1]!} />);
    await clickMenu('Unarchive Note');

    expect(store.getState().notes.entities[1]!.archived).toBeFalsy();
    rerender(<Note note={store.getState().notes.entities[1]!} />);
    await clickMenu('Pin Note');

    expect(store.getState().notes.entities[1]!.pinned).toBeTruthy();
    rerender(<Note note={store.getState().notes.entities[1]!} />);
    await clickMenu('Unpin Note');

    expect(store.getState().notes.entities[1]!.pinned).toBeFalsy();
  });
});
