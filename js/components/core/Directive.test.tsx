// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import type { Root } from 'mdast';

import * as React from 'react';

import { render } from 'components/test-utils';

import Directive, { getSeverity, directivePlugin } from './Directive';

describe('getSeverity', () => {
  test('returns expected values', () => {
    expect(getSeverity('other')).toEqual('error');
    expect(getSeverity('warning')).toEqual('warning');
    expect(getSeverity('info')).toEqual('info');
    expect(getSeverity('tip')).toEqual('success');
  });
});

test('directivePlugin', () => {
  const root: Root = {
    type: 'root',
    children: [
      { type: 'textDirective', children: [], name: '' },
      { type: 'containerDirective', children: [], name: '' },
      { type: 'leafDirective', children: [], name: '' },

      { type: 'textDirective', name: 'tip', children: [] },
      { type: 'containerDirective', name: 'warning', children: [] },
      { type: 'leafDirective', name: 'info', children: [] },
    ],
  };
  directivePlugin()(root);
  expect(root.children[0]).toMatchInlineSnapshot(`
    Object {
      "children": Array [],
      "name": "",
      "type": "textDirective",
    }
  `);
  expect(root.children[1]).toMatchInlineSnapshot(`
    Object {
      "children": Array [],
      "name": "",
      "type": "containerDirective",
    }
  `);
  expect(root.children[2]).toMatchInlineSnapshot(`
    Object {
      "children": Array [],
      "name": "",
      "type": "leafDirective",
    }
  `);
  expect(root.children[3]).toMatchInlineSnapshot(`
    Object {
      "children": Array [],
      "data": Object {
        "hName": "div",
        "hProperties": Object {
          "data-directive-type": "text",
          "data-type": "tip",
        },
      },
      "name": "tip",
      "type": "textDirective",
    }
  `);
  expect(root.children[4]).toMatchInlineSnapshot(`
    Object {
      "children": Array [],
      "data": Object {
        "hName": "div",
        "hProperties": Object {
          "data-directive-type": "block",
          "data-type": "warning",
        },
      },
      "name": "warning",
      "type": "containerDirective",
    }
  `);
  expect(root.children[5]).toMatchInlineSnapshot(`
    Object {
      "children": Array [],
      "data": Object {
        "hName": "div",
        "hProperties": Object {
          "data-directive-type": "block",
          "data-type": "info",
        },
      },
      "name": "info",
      "type": "leafDirective",
    }
  `);
});

describe('<Directive />', () => {
  test('renders as expected', () => {
    const { container } = render(<Directive type='info'>Contents</Directive>);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation0 MuiAlert-root MuiAlert-standardInfo MuiAlert-standard css-88h91o-MuiPaper-root-MuiAlert-root"
          role="alert"
        >
          <div
            class="MuiAlert-icon css-1ytlwq5-MuiAlert-icon"
          >
            <svg
              aria-hidden="true"
              class="MuiSvgIcon-root MuiSvgIcon-fontSizeInherit css-1vooibu-MuiSvgIcon-root"
              data-testid="InfoOutlinedIcon"
              focusable="false"
              viewBox="0 0 24 24"
            >
              <path
                d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20, 12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10, 10 0 0,0 12,2M11,17H13V11H11V17Z"
              />
            </svg>
          </div>
          <div
            class="MuiAlert-message css-acap47-MuiAlert-message"
          >
            Contents
          </div>
        </div>
      </div>
    `);
  });
});
