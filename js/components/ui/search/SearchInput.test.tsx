// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import userEvent from '@testing-library/user-event';

import * as React from 'react';

import { render } from 'components//test-utils';

import SearchInput from './SearchInput';

describe('<SearchInput />', () => {
  test('matches snapshot', async () => {
    const { findByRole, rerender } = render(
      <SearchInput onCancelSearch={() => {}} onChange={() => {}} onSubmit={() => {}} value='' />,
    );
    expect(await findByRole('textbox')).toMatchInlineSnapshot(`
      <input
        class="MuiInputBase-input css-yz9k0d-MuiInputBase-input"
        placeholder="Search..."
        type="text"
        value=""
      />
    `);

    rerender(
      <SearchInput
        onCancelSearch={() => {}}
        onChange={() => {}}
        onSubmit={() => {}}
        value='Search Input'
      />,
    );
    expect(await findByRole('textbox')).toMatchInlineSnapshot(`
      <input
        class="MuiInputBase-input css-yz9k0d-MuiInputBase-input"
        placeholder="Search..."
        type="text"
        value="Search Input"
      />
    `);
  });

  test('::onChange()', async () => {
    const onChange = jest.fn();
    const { findByRole } = render(
      <SearchInput onChange={onChange} onSubmit={() => {}} onCancelSearch={() => {}} value='' />,
    );
    const input = 'written word';
    await userEvent.type(await findByRole('textbox'), input);
    expect(onChange.mock.calls).toHaveLength(input.length);
  });

  test('::onSubmit()', async () => {
    const onSubmit = jest.fn();
    const { findByRole } = render(
      <SearchInput onChange={() => {}} onSubmit={onSubmit} onCancelSearch={() => {}} value='' />,
    );
    await userEvent.type(await findByRole('textbox'), 'search{enter}');
    expect(onSubmit.mock.calls.length).toEqual(1);
  });
});
