// Copyright 2017 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

// @flow

import React from 'react';

import AppBar from 'material-ui/AppBar';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import SvgIcon from 'material-ui/SvgIcon';

import GoogleG from 'ui/images/google-g.svg';

export default () => (
  <div>
    <AppBar title="Noted" />
    <Dialog
      title="Please Sign In"
      open
    >
      <RaisedButton
        label="Sign in to Google"
        onClick={() => { window.location.href = '/connect/google'; }}
        icon={<SvgIcon viewBox="0 0 20 20"><GoogleG /></SvgIcon>}
      />
    </Dialog>
  </div>
);
