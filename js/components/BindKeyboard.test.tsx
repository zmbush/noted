// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import * as MousetrapOriginal from 'mousetrap';

import * as React from 'react';

import BindKeyboard from './BindKeyboard';
import { render } from './test-utils';

jest.mock('mousetrap');
const Mousetrap = MousetrapOriginal as jest.Mocked<typeof MousetrapOriginal>;

describe('<BindKeyboard />', () => {
  test('matches snapshot', () => {
    expect(
      render(<BindKeyboard keys='key' callback={() => {}} />).container.firstChild,
    ).toMatchInlineSnapshot(`null`);

    expect(
      render(
        <BindKeyboard keys='key' callback={() => {}}>
          Contents
        </BindKeyboard>,
      ).container.firstChild,
    ).toMatchInlineSnapshot(`
      <div>
        Contents
      </div>
    `);
  });

  test('unmount works', () => {
    const cb = jest.fn();
    Mousetrap.bind.mockReset();
    Mousetrap.unbind.mockReset();

    {
      const { unmount } = render(<BindKeyboard keys='a+key' callback={cb} action='test' />);
      expect(Mousetrap.bind).toBeCalledWith('a+key', cb, 'test');
      unmount();
      expect(Mousetrap.unbind).toBeCalledWith('a+key', 'test');
    }

    {
      const newBind = jest.fn();
      const newUnbind = jest.fn();
      Mousetrap.default.mockImplementation(() => ({
        bind: newBind,
        unbind: newUnbind,
        stopCallback: jest.fn(),
        trigger: jest.fn(),
        handleKey: jest.fn(),
        reset: jest.fn(),
      }));

      const { unmount } = render(
        <BindKeyboard keys='a+key' callback={cb} action='test'>
          <div />
        </BindKeyboard>,
      );
      expect(newBind).toBeCalledWith('a+key', cb, 'test');
      unmount();
      expect(newUnbind).toBeCalledWith('a+key', 'test');
    }
  });
});
