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

import { render, waitFor } from 'components/test-utils';

import App from '../App';

describe('<App />', () => {
  test('sign in works', async () => {
    const { getByTestId, findByText, getByRole, getAllByText } = render(<App />);
    expect(getAllByText('Sign In')).toMatchInlineSnapshot(`
      Array [
        <h2
          class="MuiTypography-root MuiTypography-h6 MuiDialogTitle-root css-bdhsul-MuiTypography-root-MuiDialogTitle-root"
          id="mui-1"
        >
          Sign In
        </h2>,
        <button
          class="MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeMedium MuiButton-textSizeMedium MuiButtonBase-root  css-1e6y48t-MuiButtonBase-root-MuiButton-root"
          tabindex="0"
          type="button"
        >
          Sign In
          <span
            class="MuiTouchRipple-root css-8je8zh-MuiTouchRipple-root"
          />
        </button>,
      ]
    `);

    userEvent.type(getByTestId('email'), 'test@test.com');
    userEvent.type(getByTestId('password'), 'pass');
    userEvent.click(getByRole('button'));

    await findByText('Note 1');
  });

  describe('while signed in', () => {
    let rendered: ReturnType<typeof render>;
    beforeEach(async () => {
      rendered = render(<App />);
      const { getByTestId, getByRole, findByText } = rendered;
      userEvent.type(getByTestId('email'), 'test@test.com');
      userEvent.type(getByTestId('password'), 'pass');
      userEvent.click(getByRole('button'));

      // Wait until login is complete
      await findByText('Note 1');
    });

    test('search works', async () => {
      const { store, getByPlaceholderText } = rendered;
      userEvent.type(
        getByPlaceholderText('Search...'),
        "A Search That Shouldn't Match Anything...",
      );
      await waitFor(() => expect(store.getState().ui.firstNote).toEqual(null));
      userEvent.type(getByPlaceholderText('Search...'), '{selectall}Note 1');
      await waitFor(() => expect(store.getState().ui.firstNote).toEqual(1));
      userEvent.type(getByPlaceholderText('Search...'), '{selectall}Note 2');
      await waitFor(() => expect(store.getState().ui.firstNote).toEqual(2));
    });

    test('start edit works', async () => {
      const { getByPlaceholderText, findByTestId } = rendered;
      userEvent.type(getByPlaceholderText('Search...'), 'Note 1{enter}');
      // The note editor should show
      await findByTestId('NoteEditor');
    });
  });
});
