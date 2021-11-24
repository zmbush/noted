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

import * as React from 'react';

import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';

import { Inner as NoteEditor } from '../NoteEditor';

const editor = (
  <NoteEditor
    classes={{ editorRoot: '', titleInput: '', editorContent: '' }}
    open={false}
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

    const input = wrapper.find(ChipInput);

    input.props().onAdd('test');
    expect((wrapper.state() as any).tags).toContain('test');
    input.props().onDelete('test', 1);
    expect((wrapper.state() as any).tags).not.toContain('test');
  });

  test('title change works', () => {
    const wrapper = shallow(editor);
    wrapper
      .find(CardHeader)
      .dive()
      .dive()
      .find(Input)
      .simulate('change', { target: { value: 'new title' } });

    expect(wrapper.state('title')).toEqual('new title');

    const toastEditor = wrapper.find(CardContent).dive().dive().find(Editor);

    (wrapper.instance() as any).editor = {
      current: {
        getInstance() {
          return {
            getMarkdown() {
              return 'new body';
            },
          };
        },
      },
    };

    toastEditor.props().events.change('wysiwyg');

    expect(wrapper.state('body')).toEqual('new body');
  });

  test('switching to open works', () => {
    let focusCalled = false;
    let moveCursorToEndCalled = false;
    const wrapper = shallow(editor);
    (wrapper.instance() as any).editor = {
      current: {
        getInstance: () => ({
          focus() {
            focusCalled = true;
          },

          moveCursorToEnd() {
            moveCursorToEndCalled = true;
          },
        }),
      },
    };
    wrapper.setProps({ open: true });
    expect(focusCalled).toBeTruthy();
    expect(moveCursorToEndCalled).toBeTruthy();
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
