/**
 * @jest-environment jsdom
 */

// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import * as React from 'react';
import { shallow } from 'enzyme';
import Mousetrap from 'mousetrap';

import BindKeyboard from '../BindKeyboard';

describe('<BindKeyboard />', () => {
  test('matches snapshot', () => {
    expect(shallow(<BindKeyboard keys={'key'} callback={() => {}} />)).toMatchSnapshot();

    expect(
      shallow(
        <BindKeyboard keys={'key'} callback={() => {}}>
          Contents
        </BindKeyboard>,
      ),
    ).toMatchSnapshot();
  });

  test('unmount works', () => {
    const bindFn = jest.spyOn(Mousetrap, 'bind');
    bindFn.mockClear();

    const unbindFn = jest.spyOn(Mousetrap, 'unbind');
    unbindFn.mockClear();

    let cb = () => {};

    const wrapper = shallow(<BindKeyboard keys='a+key' callback={cb} action='toot' />);
    expect(bindFn).toBeCalledWith('a+key', cb, 'toot');
    wrapper.unmount();
    expect(unbindFn).toBeCalledWith('a+key', 'toot');
  });
});
