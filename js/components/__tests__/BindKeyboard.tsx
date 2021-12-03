// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { mount, shallow } from 'enzyme';
import * as MousetrapOriginal from 'mousetrap';

import * as React from 'react';

import BindKeyboard from '../BindKeyboard';

jest.mock('mousetrap');
const Mousetrap = MousetrapOriginal as jest.Mocked<typeof MousetrapOriginal>;

describe('<BindKeyboard />', () => {
  test('matches snapshot', () => {
    expect(shallow(<BindKeyboard keys='key' callback={() => {}} />)).toMatchSnapshot();

    expect(
      shallow(
        <BindKeyboard keys='key' callback={() => {}}>
          Contents
        </BindKeyboard>,
      ),
    ).toMatchSnapshot();
  });

  test('unmount works', () => {
    const cb = () => {};

    {
      const wrapper = mount(<BindKeyboard keys='a+key' callback={cb} action='toot' />);
      expect(Mousetrap.bind).toBeCalledWith('a+key', cb, 'toot');
      wrapper.unmount();
      expect(Mousetrap.unbind).toBeCalledWith('a+key', 'toot');
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

      const wrapper = mount(
        <BindKeyboard keys='a+key' callback={cb} action='toot'>
          <div />
        </BindKeyboard>,
      );
      expect(newBind).toBeCalledWith('a+key', cb, 'toot');
      wrapper.unmount();
      expect(newUnbind).toBeCalledWith('a+key', 'toot');
    }
  });
});
