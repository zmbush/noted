// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import * as React from 'react';
import { shallow } from 'enzyme';
import { createMemoryHistory } from 'history';

import { Inner as FilteredNoteList } from '../FilteredNoteList';

describe('<FilteredNoteList />', () => {
  test('matches snapshot', () => {
    const history = createMemoryHistory({ keyLength: 0 });
    expect(
      shallow(
        <FilteredNoteList
          depth={1}
          notes={new Map()}
          search=''
          updateNote={() => {}}
          deleteNote={() => {}}
          firstNoteRef={undefined}
          history={history}
          location={history.location}
          match={{
            isExact: true,
            path: '',
            url: '',
            params: {
              ids: '1',
            },
          }}
        />,
      ),
    ).toMatchSnapshot();
  });
});
