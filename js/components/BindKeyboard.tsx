// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import * as React from 'react';
import * as PropTypes from 'prop-types';

import Mousetrap from 'mousetrap';

type Props = {
  keys: string;
  action?: string;
  callback: (e: ExtendedKeyboardEvent, combo: string) => void;
};

export default class BindKeyboard extends React.Component<Props> {
  main: React.RefObject<HTMLDivElement>;
  mousetrap: MousetrapInstance | MousetrapStatic;

  constructor(props: Props) {
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
