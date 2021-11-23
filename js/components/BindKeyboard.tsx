// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
import Mousetrap from 'mousetrap';

import * as React from 'react';

type Props = {
  keys: string;
  action?: string;
  callback: (e: Mousetrap.ExtendedKeyboardEvent, combo: string) => void;
};

export default class BindKeyboard extends React.Component<Props> {
  main: React.RefObject<HTMLDivElement>;

  mousetrap: Mousetrap.MousetrapInstance | Mousetrap.MousetrapStatic;

  constructor(props: Props) {
    super(props);

    this.main = React.createRef();
  }

  componentDidMount() {
    const { children, keys, callback, action } = this.props;
    if (children) {
      this.mousetrap = new Mousetrap(this.main.current);
    } else {
      this.mousetrap = Mousetrap;
    }

    this.mousetrap.bind(keys, callback, action);
  }

  componentWillUnmount() {
    const { keys, action } = this.props;
    this.mousetrap.unbind(keys, action);
  }

  render() {
    const { children } = this.props;
    if (children) {
      return <div ref={this.main}>{children}</div>;
    }
    return null;
  }
}
