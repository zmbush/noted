// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { shallow } from 'enzyme';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { testState } from 'data/utils.forTesting';

import FilteredNoteList from '../FilteredNoteList';

// eslint-disable-next-line no-import-assign
jest.spyOn(ReactRedux, 'useSelector').mockImplementation((r) => r(testState));

describe('<FilteredNoteList />', () => {
  test('matches snapshot', () => {
    const node = shallow(<FilteredNoteList depth={1} search='' />, {
      wrappingComponent: MemoryRouter,
    });

    expect(node).toMatchSnapshot();
  });
});
