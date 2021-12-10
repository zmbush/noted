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
  jest.setTimeout(30000);
  test('matches snapshot', async () => {
    const { container, rerender, findByText, findByTestId } = render(
      <AppBody {...defaultAppBodyProps} />,
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <article
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
        <div
          class="ProseMirror"
          contenteditable="true"
          role="textbox"
        >
          <button
            class="block-menu-trigger ProseMirror-widget"
            type="button"
          >
            <svg
              fill="#4E5C6E"
              height="24px"
              viewBox="0 0 24 24"
              width="24px"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13,11 L13,6 C13,5.44771525 12.5522847,5 12,5 C11.4477153,5 11,5.44771525 11,6 L11,6 L11,11 L6,11 C5.44771525,11 5,11.4477153 5,12 C5,12.5522847 5.44771525,13 6,13 L11,13 L11,18 C11,18.5522847 11.4477153,19 12,19 C12.5522847,19 13,18.5522847 13,18 L13,13 L18,13 C18.5522847,13 19,12.5522847 19,12 C19,11.4477153 18.5522847,11 18,11 L13,11 Z"
              />
            </svg>
          </button>
          <p
            class="placeholder"
            data-empty-text="Write something nice…"
          >
            <br />
          </p>
        </div>,
      ]
    `);
  });
});
