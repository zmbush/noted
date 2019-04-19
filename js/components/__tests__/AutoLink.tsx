// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import * as React from 'react';
import { shallow } from 'enzyme';

import AutoLink, { LinkedText } from '../AutoLink';
import { Link } from 'react-router-dom';

describe('<AutoLink />', () => {
  test('works with no titles', () => {
    const wrapper = shallow(<AutoLink titles={new Map()}>Test</AutoLink>);
    expect(wrapper.contains('Test')).toBeTruthy();
  });

  test('works with some titles', () => {
    const titles = new Map();
    titles.set('Goat', new Set([1]));
    titles.set('Boat', new Set([1, 2]));

    const wrapper = shallow(
      <AutoLink titles={titles}>
        This goat is here. It also has boats galore.
      </AutoLink>
    );

    expect(
      wrapper.contains(<LinkedText ids={new Set([1])} text='Goat' />)
    ).toBeTruthy();
    expect(
      wrapper.contains(<LinkedText ids={new Set([1, 2])} text='Boat' />)
    ).toBeTruthy();
  });
});

describe('<LinkedText />', () => {
  test('works with no ids', () => {
    const wrapper = shallow(<LinkedText ids={new Set()} text='Link' />);
    expect(wrapper.contains('Link')).toBeTruthy();
  });

  test('works with 1 id', () => {
    const wrapper = shallow(<LinkedText ids={new Set([1])} text='Link' />);
    expect(wrapper.contains(<Link to='/note/1'>Link</Link>)).toBeTruthy();
  });

  test('works with more than 1 id', () => {
    const wrapper = shallow(
      <LinkedText ids={new Set([1, 2, 3])} text='Link' />
    );
    expect(
      wrapper.contains(<Link to='/disambiguation/1,2,3'>Link</Link>)
    ).toBeTruthy();
  });
});
