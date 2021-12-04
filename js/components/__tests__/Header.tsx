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
import * as ReactReduxOriginal from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { Menu } from '@mui/material';

import Header from '../Header';

jest.mock('react-redux');
const ReactRedux = ReactReduxOriginal as jest.Mocked<typeof ReactReduxOriginal>;

jest.mock('axios');

const sleep = (milliseconds: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const search = (
  <Header
    createNewShortcut={() => {}}
    setSearch={() => {}}
    onStartEdit={() => {}}
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

  test('handles user menu and sign out', async () => {
    const wrapper = shallow(search, {
      wrappingComponent: MemoryRouter,
    });
    const dispatchMock = jest.fn();
    ReactRedux.useDispatch.mockReturnValue(dispatchMock);

    const menu = wrapper.find('[aria-label="User Menu"]').first();
    menu.simulate('click');

    wrapper.setProps({});
    wrapper.update();

    expect(wrapper.find(Menu).first().props().open).toBeTruthy();
    const signOut = wrapper.find('[aria-label="Sign Out"]').first();
    signOut.simulate('click', { preventDefault: () => {} });
    await sleep(10);

    expect(dispatchMock.mock.calls).toHaveLength(1);
    // expect(dispatchMock.mock.calls[0][0]).toEqual({ type: NotedEvent.UserSignedOut });
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
