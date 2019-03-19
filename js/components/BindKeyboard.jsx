// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import React from 'react';
import Mousetrap from 'mousetrap';
import PropTypes from 'prop-types';

export default class BindKeyboard extends React.Component {
  static propTypes = {
    keys: PropTypes.string.isRequired,
    action: PropTypes.string,
    callback: PropTypes.func.isRequired,
    global: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this.main = React.createRef();
  }

  componentDidMount() {
    if (this.props.children) {
      this.mousetrap = new Mousetrap(this.main.current);
    } else {
      this.mousetrap = Mousetrap;
    }

    this.mousetrap.bind(
      this.props.keys,
      this.props.callback,
      this.props.action
    );
  }

  componentWillUnmount() {
    this.mousetrap.unbind(this.props.keys, this.props.action);
  }

  render() {
    if (this.props.children) {
      return <div ref={this.main}>{this.props.children}</div>;
    } else {
      return null;
    }
  }
}
