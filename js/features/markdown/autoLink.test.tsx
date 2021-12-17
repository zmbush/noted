// Copyright 2019 Zachary Bush.
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

describe('autoLink', () => {
  test('looks as expected', () => {
    const titles = {
      Goat: new Set([1]),
      Boat: new Set([1, 2]),
    };

    const { container } = render(
      <Viewer titles={titles}>This goat is here. It also has boats galore.</Viewer>,
    );
    expect(container.firstChild).toMatchInlineSnapshot(`
      <div
        class="MuiBox-root css-1vvitan"
      >
        <p
          class="MuiTypography-root MuiTypography-body css-37jdci-MuiTypography-root"
        >
          This 
          <a
            class="MuiTypography-root MuiTypography-inherit MuiLink-root MuiLink-underlineHover css-y71bs7-MuiTypography-root-MuiLink-root"
            href="/note/1"
          >
            Goat
          </a>
           is here. It also has 
          <a
            class="MuiTypography-root MuiTypography-inherit MuiLink-root MuiLink-underlineHover css-y71bs7-MuiTypography-root-MuiLink-root"
            href="/disambiguation/1,2"
          >
            Boat
          </a>
          s galore.
        </p>
      </div>
    `);
  });

  test('works with no titles', () => {
    const { container } = render(<Viewer titles={{}}>Test</Viewer>);
    expect(container.firstChild).toMatchInlineSnapshot(`
      <div
        class="MuiBox-root css-1vvitan"
      >
        <p
          class="MuiTypography-root MuiTypography-body css-37jdci-MuiTypography-root"
        >
          Test
        </p>
      </div>
    `);
  });

  test('works with some titles', async () => {
    const titles = {
      Goat: new Set([1]),
      Boat: new Set([1, 2]),
    };

    const { findAllByRole } = render(
      <Viewer titles={titles}>This goat is here. It also has boats galore.</Viewer>,
    );

    const links = await findAllByRole('link');
    expect(links).toHaveLength(2);

    expect(links[0].getAttribute('href')).toEqual('/note/1');
    expect(links[0].firstChild).toMatchInlineSnapshot('Goat');

    expect(links[1].getAttribute('href')).toEqual('/disambiguation/1,2');
    expect(links[1].firstChild).toMatchInlineSnapshot('Boat');
  });
});
