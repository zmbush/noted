// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import * as React from 'react';
import { shallow } from 'enzyme';

import { Inner as Note } from '../Note';

const editor = (
  <Note
    width='xl'
    classes={{} as any}
    search=''
    titles={new Map()}
    subnotes={new Map()}
    updateNote={() => {}}
    deleteNote={() => {}}
    note={{
      id: 1,
      title: 'note title',
      body: 'note body',
      tags: ['tag1'],
      created_at: '',
      updated_at: '',
      user_id: 2,
    }}
  />
);

describe('<Note />', () => {
  test('matches snapshot', () => {
    let wrapper = shallow(editor);

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
