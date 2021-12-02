// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
import { shallow } from 'enzyme';

import * as React from 'react';

import Note, { NoteContents } from '../Note';

jest.mock('react-redux');

const note = (
  <Note
    search=''
    note={{
      id: 1,
      parent_note_id: 0,
      title: 'note title',
      body: 'note body',
      tags: ['tag1'],
      created_at: '',
      updated_at: '',
      user_id: 2,
      archived: false,
      pinned: false,
    }}
  />
);

const noteContents = (
  <NoteContents
    search=''
    titles={new Map()}
    subNotes={new Map()}
    setEdit={() => {}}
    setCreatingSubNote={() => {}}
    note={{
      id: 1,
      title: 'note title',
      body: 'note body',
      tags: ['tag1'],
      created_at: '',
      updated_at: '',
      user_id: 2,
      parent_note_id: 0,
      archived: false,
      pinned: false,
    }}
  />
);

describe('<Note />', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(note);

    expect(wrapper).toMatchSnapshot();

    wrapper.setProps({
      note: {
        pinned: true,
      },
    });

    expect(wrapper).toMatchSnapshot();

    wrapper.setProps({
      note: {
        archived: true,
        pinned: false,
      },
    });

    expect(wrapper).toMatchSnapshot();
  });
});

describe('<NoteContents />', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(noteContents);

    expect(wrapper).toMatchSnapshot();

    wrapper.setProps({
      note: {
        pinned: true,
      },
    });

    expect(wrapper).toMatchSnapshot();

    wrapper.setProps({
      note: {
        archived: true,
        pinned: false,
      },
    });

    expect(wrapper).toMatchSnapshot();
  });
});
