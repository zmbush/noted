// @flow

import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';

import AppBar from 'material-ui/AppBar';
import Avatar from 'material-ui/Avatar';

import 'normalize.css';

type Props = {
  me: {
    user_name: string,
    image_url: string,
  },
  children?: React.Node,
};

class App extends React.Component<Props> {
  render() {
    const { me, children } = this.props;

    return (
      <div>
        <AppBar
          title="Noted"
          iconElementRight={<Avatar src={me.image_url} />}
        />
        { children }
      </div>
    );
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
