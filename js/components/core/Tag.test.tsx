// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import * as React from 'react';

import { render } from 'components/test-utils';

import Tag from './Tag';

describe('<Tag />', () => {
  test('base rendering', () => {
    const { container } = render(<Tag label='base' />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="MuiChip-root MuiChip-filled MuiChip-sizeMedium MuiChip-colorDefault MuiChip-filledDefault css-1e13h92-MuiChip-root"
        >
          <span
            class="MuiChip-label MuiChip-labelMedium css-6od3lo-MuiChip-label"
          >
            base
          </span>
        </div>
      </div>
    `);
  });

  test('arc rendering', () => {
    const { container } = render(<Tag label='arc:base' />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="MuiChip-root MuiChip-filled MuiChip-sizeMedium MuiChip-colorSecondary MuiChip-filledSecondary css-ru6kl5-MuiChip-root"
        >
          <svg
            aria-hidden="true"
            class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiChip-icon MuiChip-iconMedium MuiChip-iconColorSecondary css-i4bv87-MuiSvgIcon-root"
            data-testid="GestureIcon"
            focusable="false"
            viewBox="0 0 24 24"
          >
            <path
              d="M4.59 6.89c.7-.71 1.4-1.35 1.71-1.22.5.2 0 1.03-.3 1.52-.25.42-2.86 3.89-2.86 6.31 0 1.28.48 2.34 1.34 2.98.75.56 1.74.73 2.64.46 1.07-.31 1.95-1.4 3.06-2.77 1.21-1.49 2.83-3.44 4.08-3.44 1.63 0 1.65 1.01 1.76 1.79-3.78.64-5.38 3.67-5.38 5.37 0 1.7 1.44 3.09 3.21 3.09 1.63 0 4.29-1.33 4.69-6.1H21v-2.5h-2.47c-.15-1.65-1.09-4.2-4.03-4.2-2.25 0-4.18 1.91-4.94 2.84-.58.73-2.06 2.48-2.29 2.72-.25.3-.68.84-1.11.84-.45 0-.72-.83-.36-1.92.35-1.09 1.4-2.86 1.85-3.52.78-1.14 1.3-1.92 1.3-3.28C8.95 3.69 7.31 3 6.44 3 5.12 3 3.97 4 3.72 4.25c-.36.36-.66.66-.88.93l1.75 1.71zm9.29 11.66c-.31 0-.74-.26-.74-.72 0-.6.73-2.2 2.87-2.76-.3 2.69-1.43 3.48-2.13 3.48z"
            />
          </svg>
          <span
            class="MuiChip-label MuiChip-labelMedium css-6od3lo-MuiChip-label"
          >
            base
          </span>
        </div>
      </div>
    `);
  });

  test('type rendering', () => {
    const { container } = render(<Tag label='type:base' />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="MuiChip-root MuiChip-filled MuiChip-sizeMedium MuiChip-colorPrimary MuiChip-filledPrimary css-19f9w1t-MuiChip-root"
        >
          <svg
            aria-hidden="true"
            class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiChip-icon MuiChip-iconMedium MuiChip-iconColorPrimary css-i4bv87-MuiSvgIcon-root"
            data-testid="GradeIcon"
            focusable="false"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            />
          </svg>
          <span
            class="MuiChip-label MuiChip-labelMedium css-6od3lo-MuiChip-label"
          >
            base
          </span>
        </div>
      </div>
    `);
  });

  test('unknown prefix', () => {
    const { container } = render(<Tag label='unknown:base' />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="MuiChip-root MuiChip-filled MuiChip-sizeMedium MuiChip-colorPrimary MuiChip-filledPrimary css-19f9w1t-MuiChip-root"
        >
          <span
            class="MuiChip-label MuiChip-labelMedium css-6od3lo-MuiChip-label"
          >
            base
          </span>
        </div>
      </div>
    `);
  });
});
