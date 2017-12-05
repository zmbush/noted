// Copyright 2017 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

// @flow

import * as React from 'react';
import Snackbar from 'material-ui/Snackbar';

import EventManager from 'ui/components/EventManager';

type StrComponentProps = { str: string };
const StrComponent = ({ str }: StrComponentProps) => str;

type Props = {};
type State = {
  messages: StrComponent[],
};

export default class NotificationCenter extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      messages: [],
    };
  }

  handleNotifyUser = (e: ?mixed) => {
    if (typeof e === 'string') {
      this.setState({
        messages: [...this.state.messages, <StrComponent str={e} />],
      });
    }
  }

  messageSeen = () => {
    this.setState({
      messages: this.state.messages.slice(1),
    });
  }

  renderSnackbar() {
    if (this.state.messages.length > 0) {
      return (
        <Snackbar
          open
          message={this.state.messages[0]}
          onRequestClose={this.messageSeen}
          autoHideDuration={1000}
        />
      );
    }
    return <Snackbar open={false} message="" />;
  }

  render() {
    return (
      <React.Fragment>
        <EventManager handlers={{ NOTIFY_USER: this.handleNotifyUser }} />
        { this.renderSnackbar() }
      </React.Fragment>
    );
  }
}
