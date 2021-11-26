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
import { MemoryRouter } from 'react-router-dom';

import Header from '../Header';

const sleep = (milliseconds: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const search = (
  <Header
    createNewShortcut={() => {}}
    setSearch={() => {}}
    onStartEdit={() => {}}
    onSignOut={() => {}}
    debounceInterval={10}
  />
);
describe('<Header />', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(search, {
      wrappingComponent: MemoryRouter,
    });
    expect(wrapper.find(Header)).toMatchSnapshot();
  });

  test('::setSearch()', async () => {
    const setSearch = jest.fn();
    const wrapper = mount(search, {
      wrappingComponent: MemoryRouter,
    });
    wrapper.setProps({ setSearch });

    wrapper
      .find('input')
      .first()
      .simulate('change', { target: { value: 'written word' } });

    await sleep(10);
    expect(setSearch.mock.calls.length).toEqual(1);
    expect(setSearch.mock.calls[0][0]).toEqual('written word');

    wrapper
      .find('input')
      .first()
      .simulate('change', { target: { value: 'written words' } });

    await sleep(10);
    expect(setSearch.mock.calls.length).toEqual(2);
    expect(setSearch.mock.calls[1][0]).toEqual('written words');
  });

  // test('::onChange()', () => {
  //   const onChange = jest.fn();
  //   const wrapper = mount(search);
  //   wrapper.setProps({ onChange });

  //   wrapper
  //     .find('input')
  //     .first()
  //     .simulate('change', { target: { value: 'written word' } });

  //   expect(onChange.mock.calls.length).toEqual(1);
  //   expect(onChange.mock.calls[0][0].target.value).toEqual('written word');
  // });

  // test('::onSubmit()', () => {
  //   const onSubmit = jest.fn();
  //   const wrapper = mount(search);
  //   wrapper.setProps({ onSubmit });

  //   wrapper.find('form').first().simulate('submit');
  //   expect(onSubmit.mock.calls.length).toEqual(1);
  // });
});
