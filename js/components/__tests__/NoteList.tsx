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

import { Inner as NoteList } from '../NoteList';

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
                title: 'SingleNote 1',
                body: 'The Body',
                tags: [],
              },
            ],
            [
              4,
              {
                title: 'SingleNote 4',
                body: 'The Body',
                tags: [],
              },
            ],
            [
              2,
              {
                title: 'SingleNote 2',
                body: 'The Body',
                tags: [],
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
                title: 'SingleNote 1',
                body: 'The Body',
                tags: [],
              },
            ],
            [
              4,
              {
                title: 'SingleNote 4',
                body: 'The Body',
                tags: [],
              },
            ],
            [
              2,
              {
                title: 'SingleNote 2',
                body: 'The Body',
                tags: [],
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
