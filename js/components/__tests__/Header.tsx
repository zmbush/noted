// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import userEvent from '@testing-library/user-event';

import * as React from 'react';

import { render, sleep } from 'components/test-utils';
import { signInUser } from 'data/user/api';

import Header from '../Header';

describe('<Header />', () => {
  test('matches snapshot', () => {
    expect(
      render(
        <Header
          createNewShortcut={() => {}}
          setSearch={() => {}}
          onStartEdit={() => {}}
          debounceInterval={10}
        />,
      ).container,
    ).toMatchSnapshot();
  });

  test('::setSearch', async () => {
    const setSearch = jest.fn();
    const { findByRole } = render(
      <Header
        createNewShortcut={() => {}}
        setSearch={setSearch}
        onStartEdit={() => {}}
        debounceInterval={5}
      />,
    );

    const input = await findByRole('textbox');
    userEvent.type(input, 'written word');

    await sleep(10);
    expect(setSearch.mock.calls).toHaveLength(1);
    expect(setSearch.mock.calls[0][0]).toEqual('written word');

    userEvent.type(input, 's');
    await sleep(10);
    expect(setSearch.mock.calls).toHaveLength(2);
    expect(setSearch.mock.calls[1][0]).toEqual('written words');
  });

  test('handles user menu and sign out', async () => {
    const { findByTestId, findByText, store } = render(
      <Header
        createNewShortcut={() => {}}
        setSearch={() => {}}
        onStartEdit={() => {}}
        debounceInterval={10}
      />,
    );

    await store.dispatch(signInUser({ email: 'test@test.com', password: 'pass' }));

    const menuButton = await findByTestId('AccountCircleIcon');
    userEvent.click(menuButton);

    const signOutButton = await findByText('Sign Out');
    userEvent.click(signOutButton);

    await sleep(10);

    expect(store.getState()).toMatchInlineSnapshot(`
      Object {
        "notes": Object {
          "entities": Object {},
          "ids": Array [],
        },
        "ui": Object {
          "inProgress": Object {},
          "lastError": null,
          "noteChanging": Object {},
        },
        "user": Object {
          "isSignedIn": false,
          "user": null,
        },
      }
    `);
  });

  test('::onStartEdit', async () => {
    const onStartEdit = jest.fn();
    const { findByRole } = render(
      <Header
        createNewShortcut={() => {}}
        setSearch={() => {}}
        onStartEdit={onStartEdit}
        debounceInterval={5}
      />,
    );

    const input = await findByRole('textbox');
    userEvent.type(input, 'written word{enter}');
    expect(onStartEdit.mock.calls).toHaveLength(1);
  });

  test('opens side menu', async () => {
    const { findByTestId, queryByText, findByText } = render(
      <Header
        createNewShortcut={() => {}}
        setSearch={() => {}}
        onStartEdit={() => {}}
        debounceInterval={5}
      />,
    );

    // Side menu shouldn't be visible.
    expect(await queryByText('Archive')).toEqual(null);

    const mainMenu = await findByTestId('MenuIcon');
    userEvent.click(mainMenu);

    // Side menu should now be visible.
    await findByText('Archive');
  });
});
