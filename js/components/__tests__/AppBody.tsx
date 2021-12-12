// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//

/* eslint-disable react/jsx-props-no-spreading */
import * as React from 'react';

import { render } from 'components/test-utils';

import AppBody from '../AppBody';

const defaultAppBodyProps = {
  createNewShortcut: jest.fn(),
  notes: {},
  newNote: false,
  search: '',
  onNewNoteCancel: jest.fn(),
};

describe('<AppBody />', () => {
  jest.setTimeout(30000);
  test('matches snapshot', async () => {
    const { container } = render(<AppBody {...defaultAppBodyProps} />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <article
          class="MuiGrid-root MuiGrid-container MuiGrid-spacing-xs-1 css-1r1w6xa-MuiGrid-root"
        />
      </div>
    `);
  });
});
