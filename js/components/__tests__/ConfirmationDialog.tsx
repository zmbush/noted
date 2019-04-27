// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import * as React from 'react';
import { shallow } from 'enzyme';

import ConfirmationDialog from '../ConfirmationDialog';

describe('<ConfirmationDialog />', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(<ConfirmationDialog open />);
    expect(wrapper).toMatchSnapshot();
  });

  test('defaultProps', () => {
    ConfirmationDialog.defaultProps.onNegative();
    ConfirmationDialog.defaultProps.onPositive();

    expect(ConfirmationDialog.defaultProps.message).toEqual('Are you sure?');
    expect(ConfirmationDialog.defaultProps.negative).toEqual('No');
    expect(ConfirmationDialog.defaultProps.positive).toEqual('Yes');
  });
});
