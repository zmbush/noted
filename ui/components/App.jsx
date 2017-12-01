// @flow

import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';

import AppBar from 'material-ui/AppBar';
import Avatar from 'material-ui/Avatar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';

import 'normalize.css';
import LogInPlease from 'ui/components/LogInPlease';

// eslint-disable-next-line camelcase
import type { App_me } from './__generated__/App_me.graphql';

type Props = {
  me: ?App_me, // eslint-disable-line camelcase
  children: ?React.Node,
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
            onLeftIconButtonTouchTap={() => this.setMenuOpen(true)}
          />
          <Drawer
            docked={false}
            open={this.state.menuOpen}
            onRequestChange={this.setMenuOpen}
          >
            <MenuItem onClick={() => { window.location.href = '/logout'; }}>Sign Out</MenuItem>
          </Drawer>
          { children }
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
