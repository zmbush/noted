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

import AutoLink, { LinkedText } from '../AutoLink';

describe('<AutoLink />', () => {
  test('looks as expected', () => {
    const titles = {
      Goat: new Set([1]),
      Boat: new Set([1, 2]),
    };

    const { container } = render(
      <AutoLink titles={titles}>This goat is here. It also has boats galore.</AutoLink>,
    );
    expect(container.innerHTML).toEqual(
      `This <a href="/note/1">Goat</a> is here. It also has <a href="/disambiguation/1,2">Boat</a>s galore.`,
    );
  });

  test('works with no titles', () => {
    const { container } = render(<AutoLink titles={{}}>Test</AutoLink>);
    expect(container.firstChild).toMatchInlineSnapshot('Test');
  });

  test('works with some titles', async () => {
    const titles = {
      Goat: new Set([1]),
      Boat: new Set([1, 2]),
    };

    const { findAllByRole } = render(
      <AutoLink titles={titles}>This goat is here. It also has boats galore.</AutoLink>,
    );

    const links = await findAllByRole('link');
    expect(links).toHaveLength(2);

    expect(links[0].getAttribute('href')).toEqual('/note/1');
    expect(links[0].firstChild).toMatchInlineSnapshot('Goat');

    expect(links[1].getAttribute('href')).toEqual('/disambiguation/1,2');
    expect(links[1].firstChild).toMatchInlineSnapshot('Boat');
  });
});

describe('<LinkedText />', () => {
  test('matches snapshot', () => {
    expect(render(<LinkedText ids={new Set()} text='Link' />).container).toMatchInlineSnapshot(`
      <div>
        Link
      </div>
    `);
    expect(render(<LinkedText ids={new Set([1])} text='Link' />).container).toMatchInlineSnapshot(`
      <div>
        <a
          href="/note/1"
        >
          Link
        </a>
      </div>
    `);
    expect(render(<LinkedText ids={new Set([1, 2])} text='Link' />).container)
      .toMatchInlineSnapshot(`
      <div>
        <a
          href="/disambiguation/1,2"
        >
          Link
        </a>
      </div>
    `);
  });

  test('works with no ids', () => {
    const { container } = render(<LinkedText ids={new Set()} text='Link' />);
    expect(container.firstChild).toMatchInlineSnapshot('Link');
  });

  test('works with 1 id', async () => {
    const { findByRole } = render(<LinkedText ids={new Set([1])} text='Link' />);
    const link = await findByRole('link');
    expect(link.getAttribute('href')).toEqual('/note/1');
    expect(link.firstChild).toMatchInlineSnapshot('Link');
  });

  test('works with more than 1 id', async () => {
    const { findByRole } = render(<LinkedText ids={new Set([1, 2, 3])} text='Link' />);
    const link = await findByRole('link');
    expect(link.getAttribute('href')).toEqual('/disambiguation/1,2,3');
    expect(link.firstChild).toMatchInlineSnapshot('Link');
  });
});
