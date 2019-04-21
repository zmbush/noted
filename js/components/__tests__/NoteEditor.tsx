// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import * as React from 'react';
import { shallow } from 'enzyme';

import NoteEditor, { Inner } from '../NoteEditor';
import ChipInput from 'material-ui-chip-input';
import IconButton from '@material-ui/core/IconButton';

describe('<NoteEditor />', () => {
  test('matches snapshot', () => {
    let wrapper = shallow(
      <NoteEditor
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
    ).dive();

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
    let wrapper = shallow(
      <NoteEditor
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
    ).dive();

    const input = wrapper.find(ChipInput);

    input.props().onAdd('test');
    expect((wrapper.state() as any).tags).toContain('test');
    input.props().onDelete('test', 1);
    expect((wrapper.state() as any).tags).not.toContain('test');
  });

  test('switching to open works', () => {
    let wrapper = shallow(
      <NoteEditor
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
    ).dive();
    wrapper.setProps({ open: true });
  });

  test('submitting works', () => {
    let noteSaved;
    let wrapper = shallow(
      <NoteEditor
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
        onSave={note => {
          noteSaved = note;
        }}
      />
    ).dive();

    wrapper
      .find('WithStyles(CardHeader)')
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
