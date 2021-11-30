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
import { MemoryRouter } from 'react-router-dom';

import { NoteWithTags } from 'data/api_types';

import { Inner as NoteList } from '../NoteList';

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

describe('<NoteList />', () => {
  test('matches snapshot', () => {
    const node = shallow(
      <NoteList
        searchIndex={new Map()}
        sortedIds={[1, 2, 4]}
        depth={1}
        notes={
          new Map([
            [
              1,
              {
                ...emptyNote,
                title: 'SingleNote 1',
                body: 'The Body',
              },
            ],
            [
              4,
              {
                ...emptyNote,
                title: 'SingleNote 4',
                body: 'The Body',
              },
            ],
            [
              2,
              {
                ...emptyNote,
                title: 'SingleNote 2',
                body: 'The Body',
              },
            ],
          ])
        }
        search=''
        onUpdateNote={() => {}}
        onDeleteNote={() => {}}
      />,
      { wrappingComponent: MemoryRouter },
    );

    expect(node).toMatchSnapshot();
  });

  test('matches second snapshot', () => {
    const node = shallow(
      <NoteList
        searchIndex={new Map()}
        sortedIds={[1, 2, 4]}
        depth={1}
        notes={
          new Map([
            [
              1,
              {
                ...emptyNote,
                title: 'SingleNote 1',
                body: 'The Body',
              },
            ],
            [
              4,
              {
                ...emptyNote,
                title: 'SingleNote 4',
                body: 'The Body',
              },
            ],
            [
              2,
              {
                ...emptyNote,
                title: 'SingleNote 2',
                body: 'The Body',
              },
            ],
          ])
        }
        search='SingleNote 2'
        onUpdateNote={() => {}}
        onDeleteNote={() => {}}
      />,
      { wrappingComponent: MemoryRouter },
    );
    expect(node).toMatchSnapshot();
  });
});
