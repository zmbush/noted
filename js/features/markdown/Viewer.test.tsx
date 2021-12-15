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

import Viewer from './Viewer';

describe('<Viewer />', () => {
  test('base rendering', () => {
    const { container } = render(<Viewer>Contents</Viewer>);
    expect(container.firstChild).toMatchInlineSnapshot(`
      <div
        class="MuiBox-root css-1vvitan"
      >
        <p
          class="MuiTypography-root MuiTypography-body1 css-ahj2mt-MuiTypography-root"
        >
          Contents
        </p>
      </div>
    `);
  });

  test('handles escaped newline', () => {
    const { container } = render(<Viewer>{'\n\\\n'}</Viewer>);
    expect(container.firstChild).toMatchInlineSnapshot(`
      <div
        class="MuiBox-root css-1vvitan"
      >
        <p
          class="MuiTypography-root MuiTypography-body1 css-ahj2mt-MuiTypography-root"
        />
      </div>
    `);
  });

  test('handles autolink', () => {
    const { container } = render(<Viewer titles={{ tent: new Set([1]) }}>Contents</Viewer>);
    expect(container.firstChild).toMatchInlineSnapshot(`
      <div
        class="MuiBox-root css-1vvitan"
      >
        <p
          class="MuiTypography-root MuiTypography-body1 css-ahj2mt-MuiTypography-root"
        >
          Con
          <a
            href="/note/1"
          >
            tent
          </a>
          s
        </p>
      </div>
    `);
  });

  test('handles directives', () => {
    const { getByRole } = render(<Viewer>{':::tip\nTip Contents\n:::'}</Viewer>);
    expect(getByRole('alert')).toMatchInlineSnapshot(`
      <div
        class="MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation0 MuiAlert-root MuiAlert-standardSuccess MuiAlert-standard css-1sz7pvn-MuiPaper-root-MuiAlert-root"
        role="alert"
      >
        <div
          class="MuiAlert-icon css-1ytlwq5-MuiAlert-icon"
        >
          <svg
            aria-hidden="true"
            class="MuiSvgIcon-root MuiSvgIcon-fontSizeInherit css-1vooibu-MuiSvgIcon-root"
            data-testid="SuccessOutlinedIcon"
            focusable="false"
            viewBox="0 0 24 24"
          >
            <path
              d="M20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.76,4 13.5,4.11 14.2, 4.31L15.77,2.74C14.61,2.26 13.34,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0, 0 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z"
            />
          </svg>
        </div>
        <div
          class="MuiAlert-message css-acap47-MuiAlert-message"
        >
          <p
            class="MuiTypography-root MuiTypography-body1 css-ahj2mt-MuiTypography-root"
          >
            Tip Contents
          </p>
        </div>
      </div>
    `);
  });

  test('passes through html', () => {
    const { container } = render(<Viewer>{'<div>contents</div>'}</Viewer>);
    expect(container.firstChild).toMatchInlineSnapshot(`
      <div
        class="MuiBox-root css-1vvitan"
      >
        <div>
          contents
        </div>
      </div>
    `);
  });

  test('handles headers', () => {
    const md = `
# Header 1
## Header 2
### Header 3
#### Header 4
##### Header 5
###### Header 6`;
    const { getByText } = render(<Viewer>{md}</Viewer>);
    expect(getByText('Header 1')).toMatchInlineSnapshot(`
      <h2
        class="MuiTypography-root MuiTypography-h2 css-1teg9c3-MuiTypography-root"
      >
        Header 1
      </h2>
    `);
    expect(getByText('Header 2')).toMatchInlineSnapshot(`
      <h3
        class="MuiTypography-root MuiTypography-h3 css-1efi1j1-MuiTypography-root"
      >
        Header 2
      </h3>
    `);
    expect(getByText('Header 3')).toMatchInlineSnapshot(`
      <h4
        class="MuiTypography-root MuiTypography-h4 css-1i2ejxq-MuiTypography-root"
      >
        Header 3
      </h4>
    `);
    expect(getByText('Header 4')).toMatchInlineSnapshot(`
      <h5
        class="MuiTypography-root MuiTypography-h5 css-ejfiay-MuiTypography-root"
      >
        Header 4
      </h5>
    `);
    expect(getByText('Header 5 Header 6')).toMatchInlineSnapshot(`
      <div
        class="MuiBox-root css-1vvitan"
      >
        <h2
          class="MuiTypography-root MuiTypography-h2 css-1teg9c3-MuiTypography-root"
        >
          Header 1
        </h2>
        

        <h3
          class="MuiTypography-root MuiTypography-h3 css-1efi1j1-MuiTypography-root"
        >
          Header 2
        </h3>
        

        <h4
          class="MuiTypography-root MuiTypography-h4 css-1i2ejxq-MuiTypography-root"
        >
          Header 3
        </h4>
        

        <h5
          class="MuiTypography-root MuiTypography-h5 css-ejfiay-MuiTypography-root"
        >
          Header 4
        </h5>
        

        Header 5
        

        Header 6
      </div>
    `);
  });

  test('handles checkboxes', () => {
    const md = `
* [ ] Task 1
* [x] Task 2`;
    const { getByText } = render(<Viewer>{md}</Viewer>);
    expect(getByText('Task 1')).toMatchInlineSnapshot(`
      <li
        class="task-list-item"
      >
        <input
          disabled=""
          type="checkbox"
        />
         Task 1
      </li>
    `);
    expect(getByText('Task 2')).toMatchInlineSnapshot(`
      <li
        class="checked task-list-item"
      >
        <input
          checked=""
          disabled=""
          type="checkbox"
        />
         Task 2
      </li>
    `);
  });

  test('handles tables', () => {
    const md = `
| Title 1 | Title 2 | Title 3 |
|---------|---------|---------|
| contents| cont    | ent     |`;
    const { getByText } = render(<Viewer>{md}</Viewer>);
    expect(getByText('Title 1')!.parentNode!.parentNode!.parentNode).toMatchInlineSnapshot(`
      <table
        class="MuiTable-root css-rqglhn-MuiTable-root"
      >
        <thead
          class="MuiTableHead-root css-15wwp11-MuiTableHead-root"
        >
          <tr
            class="MuiTableRow-root MuiTableRow-head css-90vexg-MuiTableRow-root"
          >
            <th
              class="MuiTableCell-root MuiTableCell-head MuiTableCell-sizeMedium css-fwu7i1-MuiTableCell-root"
              scope="col"
              style="text-align: none;"
            >
              Title 1
            </th>
            <th
              class="MuiTableCell-root MuiTableCell-head MuiTableCell-sizeMedium css-fwu7i1-MuiTableCell-root"
              scope="col"
              style="text-align: none;"
            >
              Title 2
            </th>
            <th
              class="MuiTableCell-root MuiTableCell-head MuiTableCell-sizeMedium css-fwu7i1-MuiTableCell-root"
              scope="col"
              style="text-align: none;"
            >
              Title 3
            </th>
          </tr>
        </thead>
        <tbody
          class="MuiTableBody-root css-cu79t-MuiTableBody-root"
        >
          <tr
            class="MuiTableRow-root css-90vexg-MuiTableRow-root"
          >
            <td
              class="MuiTableCell-root MuiTableCell-body MuiTableCell-sizeMedium css-4mbnjq-MuiTableCell-root"
              style="text-align: none;"
            >
              contents
            </td>
            <td
              class="MuiTableCell-root MuiTableCell-body MuiTableCell-sizeMedium css-4mbnjq-MuiTableCell-root"
              style="text-align: none;"
            >
              cont
            </td>
            <td
              class="MuiTableCell-root MuiTableCell-body MuiTableCell-sizeMedium css-4mbnjq-MuiTableCell-root"
              style="text-align: none;"
            >
              ent
            </td>
          </tr>
        </tbody>
      </table>
    `);
  });
});
