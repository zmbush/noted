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

import NoteEditor from '../NoteEditor';

const editorProps: Parameters<typeof NoteEditor>[0] = {
  note: {
    id: 1,
    title: 'note title',
    body: 'note body',
    tags: [],
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
    const tagsInput = getByTestId('tags-input');
    userEvent.type(tagsInput, 'A Tag{enter}Another Tag{enter}A Third Tag{enter}');
    expect(getByText('A Tag')).toMatchInlineSnapshot(`
      <span
        class="MuiChip-label"
      >
        A Tag
      </span>
    `);
    expect(getByText('Another Tag')).toMatchInlineSnapshot(`
      <span
        class="MuiChip-label"
      >
        Another Tag
      </span>
    `);
    expect(getByText('A Third Tag')).toMatchInlineSnapshot(`
      <span
        class="MuiChip-label"
      >
        A Third Tag
      </span>
    `);

    // Click delete button
    userEvent.click(getByText('A Third Tag').parentElement.children[1]);
    expect(queryByText('A Third Tag')).toBeNull();

    getByText('A Tag');
    userEvent.click(getByText('A Tag').parentElement.children[1]);
    expect(queryByText('A Tag')).toBeNull();

    userEvent.click(getByTestId('SaveIcon'));
    expect(editorProps.onSave).toHaveBeenLastCalledWith({
      body: 'note body',
      parent_note_id: undefined,
      tags: ['Another Tag'],
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
      body: 'note body',
      parent_note_id: undefined,
      tags: [],
      title: 'note title More Title',
    });
  });

  test('body change works', () => {
    const { getByDisplayValue, getByTestId } = render(<NoteEditor {...editorProps} />);
    const bodyInput = getByDisplayValue(editorProps.note.body);

    expect(bodyInput).toMatchInlineSnapshot(`
      <input
        value="note body"
      />
    `);
    userEvent.type(bodyInput, ' More Body');
    expect(bodyInput).toMatchInlineSnapshot(`
      <input
        value="note body More Body"
      />
    `);

    userEvent.click(getByTestId('SaveIcon'));
    expect(editorProps.onSave).toHaveBeenLastCalledWith({
      body: 'note body More Body',
      parent_note_id: undefined,
      tags: [],
      title: 'note title',
    });
  });
});
