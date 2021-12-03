// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { Editor } from '@toast-ui/react-editor';
import { shallow } from 'enzyme';
import ChipInput from 'material-ui-chip-input';

import React from 'react';

import { CardContent, CardHeader, IconButton, Input } from '@mui/material';

import NoteEditor from '../NoteEditor';

jest.spyOn(React, 'useRef').mockReturnValue({
  current: {
    getInstance() {
      return {
        getMarkdown() {
          return 'new body';
        },
      };
    },
  },
});

const editor = (
  <NoteEditor
    note={{
      id: 1,
      title: 'note title',
      body: 'note body',
      tags: ['tag1'],
      created_at: '',
      updated_at: '',
      user_id: 2,
    }}
    onSave={() => {}}
    onModified={() => {}}
  />
);

describe('<NoteEditor />', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(editor);

    expect(wrapper).toMatchSnapshot();

    wrapper.setProps({
      note: {
        title: 'new title',
        body: 'new body',
        tags: ['tag2'],
      },
    });

    expect(wrapper).toMatchSnapshot();
  });

  test('tag input works', () => {
    const wrapper = shallow(editor);

    wrapper.find(ChipInput).props().onAdd('test');
    expect(wrapper.find(ChipInput).props().value).toContain('test');

    wrapper.find(ChipInput).props().onDelete('test', 1);
    expect(wrapper.find(ChipInput).props().value).not.toContain('test');
  });

  test('title change works', () => {
    const wrapper = shallow(editor);
    const onSave = jest.fn();
    wrapper.setProps({ onSave });
    wrapper
      .find(CardHeader)
      .dive()
      .dive()
      .find(Input)
      .simulate('change', { target: { value: 'new title' } });

    expect(wrapper.find(CardHeader).dive().dive().find(Input).props().value).toEqual('new title');

    const toastEditor = wrapper.find(CardContent).dive().dive().find(Editor);
    toastEditor.props().events.change('wysiwyg');

    wrapper
      .find(CardHeader)
      .dive()
      .dive()
      .find('[aria-label="Save Note"]')
      .first()
      .simulate('click', { preventDefault: () => {} });

    expect(onSave).toHaveBeenCalledWith({
      title: 'new title',
      body: 'new body',
      parent_note_id: undefined,
      tags: ['tag1'],
    });
  });

  test('submitting works', () => {
    let noteSaved;
    const wrapper = shallow(editor);
    wrapper.setProps({
      onSave: (note: any) => {
        noteSaved = note;
      },
    });

    wrapper
      .find(CardHeader)
      .dive()
      .dive()
      .find(IconButton)
      .simulate('click', { preventDefault() {} });

    expect(noteSaved).toEqual({
      title: 'note title',
      body: 'note body',
      tags: ['tag1'],
    });
  });
});
