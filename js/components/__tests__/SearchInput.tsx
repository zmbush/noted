// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { mount, shallow } from 'enzyme';

import * as React from 'react';

import SearchInput from '../SearchInput';

const search = (
  <SearchInput onCancelSearch={() => {}} onChange={() => {}} onSubmit={() => {}} value='' />
);
describe('<SearchInput />', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(search);
    expect(wrapper).toMatchSnapshot();

    wrapper.setProps({
      value: 'Search Input',
    });
    expect(wrapper).toMatchSnapshot();
  });

  test('::onChange()', () => {
    const onChange = jest.fn();
    const wrapper = mount(search);
    wrapper.setProps({ onChange });

    wrapper
      .find('input')
      .first()
      .simulate('change', { target: { value: 'written word' } });

    expect(onChange.mock.calls.length).toEqual(1);
    expect(onChange.mock.calls[0][0].target.value).toEqual('written word');
  });

  test('::onSubmit()', () => {
    const onSubmit = jest.fn();
    const wrapper = mount(search);
    wrapper.setProps({ onSubmit });

    wrapper.find('form').first().simulate('submit');
    expect(onSubmit.mock.calls.length).toEqual(1);
  });
});
