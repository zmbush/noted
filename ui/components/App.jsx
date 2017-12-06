// Copyright 2017 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

// @flow

import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';

import AppBar from 'material-ui/AppBar';
import Avatar from 'material-ui/Avatar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';

import 'normalize.css';
import LogInPlease from 'ui/components/LogInPlease';
import NotificationCenter from 'ui/components/NotificationCenter';

// eslint-disable-next-line camelcase
import type { App_me } from './__generated__/App_me.graphql';

type Props = {
  me: ?App_me, // eslint-disable-line camelcase
  children: ?React.Node,
  router: { push: (string) => void },
};

type State = {
  menuOpen: bool,
};

class App extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      menuOpen: false,
    };
  }

  setMenuOpen = (menuOpen) => {
    this.setState({ menuOpen });
  }

  render() {
    const { me, children } = this.props;

    if (me) {
      return (
        <div>
          <AppBar
            title="Noted"
            iconElementRight={<Avatar src={me.image_url} />}
            onTitleClick={() => this.props.router.push('/')}
            onLeftIconButtonClick={() => this.setMenuOpen(true)}
          />
          <Drawer
            docked={false}
            open={this.state.menuOpen}
            onRequestChange={this.setMenuOpen}
          >
            <MenuItem onClick={() => { window.location.href = '/logout'; }}>Sign Out</MenuItem>
          </Drawer>
          { children }
          <NotificationCenter />
        </div>
      );
    }
    return <LogInPlease />;
  }
}

export default createFragmentContainer(
  App,
  graphql`
      fragment App_me on User {
        user_name
        image_url
      }
  `,
);
