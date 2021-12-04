// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
import * as React from 'react';

import { render } from 'components/test-utils';

import ConfirmationDialog from '../ConfirmationDialog';

describe('<ConfirmationDialog />', () => {
  test('Renders as expected', async () => {
    const { rerender, queryByText, getByText } = render(<ConfirmationDialog open={false} />);
    expect(queryByText('Are you sure?')).toBeNull();
    expect(queryByText('Yes')).toBeNull();
    expect(queryByText('No')).toBeNull();

    rerender(<ConfirmationDialog open />);
    expect(getByText('Are you sure?')).toMatchInlineSnapshot(`
      <div
        class="MuiDialogContent-root css-ypiqx9-MuiDialogContent-root"
      >
        Are you sure?
      </div>
    `);
    expect(getByText('Yes')).toMatchInlineSnapshot(`
      <button
        class="MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeMedium MuiButton-textSizeMedium MuiButtonBase-root  css-1e6y48t-MuiButtonBase-root-MuiButton-root"
        tabindex="0"
        type="button"
      >
        Yes
        <span
          class="MuiTouchRipple-root css-8je8zh-MuiTouchRipple-root"
        />
      </button>
    `);
    expect(getByText('No')).toMatchInlineSnapshot(`
      <button
        class="MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeMedium MuiButton-textSizeMedium MuiButtonBase-root  css-1e6y48t-MuiButtonBase-root-MuiButton-root"
        tabindex="0"
        type="button"
      >
        No
        <span
          class="MuiTouchRipple-root css-8je8zh-MuiTouchRipple-root"
        />
      </button>
    `);
  });
});
