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

import { notesFetched } from 'data/actions';
import rootReducer from 'data/reducers';
import { NoteWithTags } from 'data/types';

import NoteList from '../NoteList';

jest.mock('react-router');
const ReactRouterDom = ReactRouterDomOriginal as jest.Mocked<typeof ReactRouterDomOriginal>;

const emptyNote: NoteWithTags = {
  id: -1,
  user_id: -1,
  title: '',
  body: '',
  tags: [],
  archived: false,
  pinned: false,
  parent_note_id: 0,
  created_at: '',
  updated_at: '',
};

const state = rootReducer(
  undefined,
  notesFetched([
    { ...emptyNote, id: 1, title: 'SingleNote 1', body: 'The Body' },
    { ...emptyNote, id: 4, title: 'SingleNote 4', body: 'The Body' },
    { ...emptyNote, id: 2, title: 'SingleNote 2', body: 'The Body' },
  ]),
);
ReactRouterDom.useMatch.mockReturnValue(null);
// eslint-disable-next-line no-import-assign
jest.spyOn(ReactRedux, 'useSelector').mockImplementation((r) => r(state));

describe('<NoteList />', () => {
  test('matches snapshot', () => {
    const node = shallow(<NoteList parent_note_id={0} depth={1} notes={state.notes} search='' />);

    expect(node).toMatchSnapshot();
  });

  test('matches second snapshot', () => {
    const node = shallow(
      <NoteList parent_note_id={0} depth={1} notes={state.notes} search='SingleNote 2' />,
    );
    expect(node).toMatchSnapshot();
  });
});
