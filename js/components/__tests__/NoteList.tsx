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
import * as ReactRouterDomOriginal from 'react-router-dom';

import { testState } from 'data/utils.forTesting';

import NoteList from '../NoteList';

jest.mock('react-router');
const ReactRouterDom = ReactRouterDomOriginal as jest.Mocked<typeof ReactRouterDomOriginal>;

ReactRouterDom.useMatch.mockReturnValue(null);
// eslint-disable-next-line no-import-assign
jest.spyOn(ReactRedux, 'useSelector').mockImplementation((r) => r(testState));

describe('<NoteList />', () => {
  test('matches snapshot', () => {
    const node = shallow(
      <NoteList parent_note_id={0} depth={1} notes={testState.notes} search='' />,
    );

    expect(node).toMatchSnapshot();
  });

  test('matches second snapshot', () => {
    const node = shallow(
      <NoteList parent_note_id={0} depth={1} notes={testState.notes} search='SingleNote 2' />,
    );
    expect(node).toMatchSnapshot();
  });
});
