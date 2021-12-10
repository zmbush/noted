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

import Markdown from './Markdown';

describe('<Markdown />', () => {
  test('base rendering', () => {
    const { container } = render(<Markdown>Contents</Markdown>);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <p>
          Contents
        </p>
      </div>
    `);
  });

  test('handles escaped newline', () => {
    const { container } = render(<Markdown>{'\n\\\n'}</Markdown>);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <br />
      </div>
    `);
  });

  test('handles autolink', () => {
    const { container } = render(<Markdown titles={{ tent: new Set([1]) }}>Contents</Markdown>);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <p>
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
    const { getByRole } = render(<Markdown>{':::tip\nTip Contents\n:::'}</Markdown>);
    expect(getByRole('alert')).toMatchInlineSnapshot(`
      <div
        class="MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation0 MuiAlert-root MuiAlert-standardSuccess MuiAlert-standard css-xca4xn-MuiPaper-root-MuiAlert-root"
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
          <p>
            Tip Contents
          </p>
        </div>
      </div>
    `);
  });

  test('passes through html', () => {
    const { container } = render(<Markdown>{'<div>contents</div>'}</Markdown>);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          contents
        </div>
      </div>
    `);
  });
});
