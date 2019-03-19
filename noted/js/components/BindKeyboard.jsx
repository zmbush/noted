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

let _globalCallbacks = {};
let _originalStopCallback = Mousetrap.prototype.stopCallback;

Object.assign(Mousetrap.prototype, {
  stopCallback(e, element, keys, sequence) {
    if (this.paused) {
      return true;
    }

    if (_globalCallbacks[keys] || _globalCallbacks[sequence]) {
      return false;
    }

    return _originalStopCallback.call(this, e, element, keys);
  },

  bindGlobal(keys, callback, action) {
    this.bind(keys, callback, action);

    if (keys instanceof Array) {
      for (var i = 0; i < keys.length; i++) {
        _globalCallbacks[keys[i]] = true;
      }
      return;
    }

    _globalCallbacks[keys] = true;
  },

  unbindGlobal(keys, action) {
    this.unbind(keys, action);

    if (keys instanceof Array) {
      for (var i = 0; i < keys.length; i++) {
        delete _globalCallbacks[keys[i]];
      }
      return;
    }

    delete _globalCallbacks[keys];
  },
});

Mousetrap.init();

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
