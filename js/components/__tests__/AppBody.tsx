// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { shallow } from 'enzyme';

import * as React from 'react';

import AppBody, { NewNote } from '../AppBody';

describe('<AppBody />', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <AppBody
        createNewShortcut={() => {}}
        notes={{}}
        newNote={false}
        search=''
        onNewNoteCancel={() => {}}
      />,
    );
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find(NewNote)).toMatchSnapshot();

    wrapper.setProps({
      search: 'Search Term',
      newNote: true,
    });
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find(NewNote)).toMatchSnapshot();
  });
});

describe('<NewNote />', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(<NewNote newNote={false} search='' onNewNoteCancel={() => {}} />);
    expect(wrapper).toMatchSnapshot();

    wrapper.setProps({
      search: 'Search Term',
      newNote: true,
    });
    expect(wrapper).toMatchSnapshot();
  });
});
