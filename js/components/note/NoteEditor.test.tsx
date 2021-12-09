// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//

/* eslint-disable react/jsx-props-no-spreading */
import userEvent from '@testing-library/user-event';

import React from 'react';

import { render } from 'components/test-utils';

import NoteEditor from './NoteEditor';

const editorProps: Parameters<typeof NoteEditor>[0] = {
  note: {
    id: 1,
    title: 'note title',
    body: `# Note Title
    
This is more content!

## Subheading
`,
    tags: ['tag1'],
    created_at: '',
    updated_at: '',
    user_id: 2,
  },
  onSave: jest.fn(),
  onModified: jest.fn(),
};

describe('<NoteEditor />', () => {
  test('matches snapshot', () => {
    const { container } = render(<NoteEditor {...editorProps} />);
    expect(container).toMatchSnapshot();
  });

  test('tag input works', async () => {
    const { getByTestId, getByText, queryByText } = render(<NoteEditor {...editorProps} />);
    const tagsInput = getByText('tag1');
    userEvent.type(tagsInput, 'A Tag{enter}Another Tag{enter}A Third Tag{enter}');
    expect(getByText('A Tag')).toMatchInlineSnapshot(`
      <span
        class="MuiChip-label MuiChip-labelMedium css-6od3lo-MuiChip-label"
      >
        A Tag
      </span>
    `);
    expect(getByText('Another Tag')).toMatchInlineSnapshot(`
      <span
        class="MuiChip-label MuiChip-labelMedium css-6od3lo-MuiChip-label"
      >
        Another Tag
      </span>
    `);
    expect(getByText('A Third Tag')).toMatchInlineSnapshot(`
      <span
        class="MuiChip-label MuiChip-labelMedium css-6od3lo-MuiChip-label"
      >
        A Third Tag
      </span>
    `);

    // Click delete button
    userEvent.click(getByText('A Third Tag').parentElement!.children[1]);
    expect(queryByText('A Third Tag')).toBeNull();

    getByText('A Tag');
    userEvent.click(getByText('A Tag').parentElement!.children[1]);
    expect(queryByText('A Tag')).toBeNull();

    userEvent.click(getByTestId('SaveIcon'));
    expect(editorProps.onSave).toHaveBeenLastCalledWith({
      body: editorProps.note.body,
      parent_note_id: undefined,
      tags: ['tag1', 'Another Tag'],
      title: 'note title',
    });
  });

  test('title change works', () => {
    const { getByDisplayValue, getByTestId } = render(<NoteEditor {...editorProps} />);
    const titleInput = getByDisplayValue(editorProps.note.title);

    expect(titleInput).toMatchInlineSnapshot(`
      <input
        class="MuiInput-input MuiInputBase-input css-1x51dt5-MuiInputBase-input-MuiInput-input"
        type="text"
        value="note title"
      />
    `);
    userEvent.type(titleInput, ' More Title');
    expect(titleInput).toMatchInlineSnapshot(`
      <input
        class="MuiInput-input MuiInputBase-input css-1x51dt5-MuiInputBase-input-MuiInput-input"
        type="text"
        value="note title More Title"
      />
    `);

    userEvent.click(getByTestId('SaveIcon'));
    expect(editorProps.onSave).toHaveBeenLastCalledWith({
      body: editorProps.note.body,
      parent_note_id: undefined,
      tags: ['tag1'],
      title: 'note title More Title',
    });
  });

  test('renders body as expected', () => {
    const { getAllByRole } = render(<NoteEditor {...editorProps} />);
    const bodyInput = getAllByRole('textbox')[1];

    expect(bodyInput).toMatchInlineSnapshot(`
      <div
        class="ProseMirror"
        contenteditable="true"
        role="textbox"
      >
        <a
          class="heading-name ProseMirror-widget"
          id="h-note-title"
        />
        <h1>
          <span
            class="heading-actions "
            contenteditable="false"
          >
            <button
              class="heading-anchor"
              type="button"
            />
            <button
              class="heading-fold "
              type="button"
            >
              <svg
                fill="currentColor"
                height="24"
                viewBox="6 0 12 24"
                width="12"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.23823905,10.6097108 L11.207376,14.4695888 L11.207376,14.4695888 C11.54411,14.907343 12.1719566,14.989236 12.6097108,14.652502 C12.6783439,14.5997073 12.7398293,14.538222 12.792624,14.4695888 L15.761761,10.6097108 L15.761761,10.6097108 C16.0984949,10.1719566 16.0166019,9.54410997 15.5788477,9.20737601 C15.4040391,9.07290785 15.1896811,9 14.969137,9 L9.03086304,9 L9.03086304,9 C8.47857829,9 8.03086304,9.44771525 8.03086304,10 C8.03086304,10.2205442 8.10377089,10.4349022 8.23823905,10.6097108 Z"
                />
              </svg>
            </button>
          </span>
          <span
            class="heading-content"
          >
            Note Title
          </span>
        </h1>
        <p>
          This is more content!
        </p>
        <a
          class="heading-name ProseMirror-widget"
          id="h-subheading"
        />
        <h2>
          <span
            class="heading-actions "
            contenteditable="false"
          >
            <button
              class="heading-anchor"
              type="button"
            />
            <button
              class="heading-fold "
              type="button"
            >
              <svg
                fill="currentColor"
                height="24"
                viewBox="6 0 12 24"
                width="12"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.23823905,10.6097108 L11.207376,14.4695888 L11.207376,14.4695888 C11.54411,14.907343 12.1719566,14.989236 12.6097108,14.652502 C12.6783439,14.5997073 12.7398293,14.538222 12.792624,14.4695888 L15.761761,10.6097108 L15.761761,10.6097108 C16.0984949,10.1719566 16.0166019,9.54410997 15.5788477,9.20737601 C15.4040391,9.07290785 15.1896811,9 14.969137,9 L9.03086304,9 L9.03086304,9 C8.47857829,9 8.03086304,9.44771525 8.03086304,10 C8.03086304,10.2205442 8.10377089,10.4349022 8.23823905,10.6097108 Z"
                />
              </svg>
            </button>
          </span>
          <span
            class="heading-content"
          >
            Subheading
          </span>
        </h2>
      </div>
    `);
  });
});
