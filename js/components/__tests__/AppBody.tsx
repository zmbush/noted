// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//

/* eslint-disable react/jsx-props-no-spreading */
import * as React from 'react';

import { render, findAllByRole } from 'components/test-utils';

import AppBody from '../AppBody';

const defaultAppBodyProps = {
  createNewShortcut: jest.fn(),
  notes: {},
  newNote: false,
  search: '',
  onNewNoteCancel: jest.fn(),
};

describe('<AppBody />', () => {
  test('matches snapshot', async () => {
    const { container, rerender, findByText, findByTestId } = render(
      <AppBody {...defaultAppBodyProps} />,
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="MuiGrid-root MuiGrid-container MuiGrid-spacing-xs-1 css-1r1w6xa-MuiGrid-root"
        />
      </div>
    `);

    rerender(<AppBody {...defaultAppBodyProps} search='A New Note' newNote />);
    expect(await findByText('Add A New Note')).toMatchInlineSnapshot(`
      <button
        class="MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButtonBase-root  css-opgcq6-MuiButtonBase-root-MuiButton-root"
        tabindex="0"
        type="button"
      >
        <svg
          aria-hidden="true"
          class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-4guzyp-MuiSvgIcon-root"
          data-testid="AddIcon"
          focusable="false"
          viewBox="0 0 24 24"
        >
          <path
            d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
          />
        </svg>
        Add 
        A New Note
        <span
          class="MuiTouchRipple-root css-8je8zh-MuiTouchRipple-root"
        />
      </button>
    `);

    // Edit note dialog is visible!
    const editNoteDialog = await findByTestId('edit-note-dialog');
    expect(await findAllByRole(editNoteDialog, 'textbox')).toMatchInlineSnapshot(`
      Array [
        <input
          class="MuiInput-input MuiInputBase-input css-1x51dt5-MuiInputBase-input-MuiInput-input"
          type="text"
          value="A New Note"
        />,
        <input
          aria-invalid="false"
          class="MuiInputBase-input MuiInput-input WAMuiChipInput-input-3 WAMuiChipInput-standard-6"
          placeholder="Tags"
          type="text"
          value=""
        />,
        <textarea
          class="toastui-editor-pseudo-clipboard"
        />,
      ]
    `);
  });
});
