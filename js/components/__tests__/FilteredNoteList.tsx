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

import { Inner as FilteredNoteList } from '../FilteredNoteList';

describe('<FilteredNoteList />', () => {
  test('matches snapshot', () => {
    const node = shallow(
      <MemoryRouter>
        <FilteredNoteList
          depth={1}
          notes={new Map()}
          search=''
          onUpdateNote={() => {}}
          onDeleteNote={() => {}}
          firstNoteRef={undefined}
        />
        ;
      </MemoryRouter>,
    );

    expect(node.find(FilteredNoteList)).toMatchSnapshot();
  });
});
