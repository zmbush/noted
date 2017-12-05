// Copyright 2017 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

// @flow

import React from 'react';

export type CustomEventType = 'NOTIFY_USER';

export const triggerEvent = (eventType: CustomEventType, detail: ?mixed) => {
  const event = new CustomEvent(eventType, { detail });
  document.dispatchEvent(event);
};

type HandlersMap = {[ event: string ]: (?mixed) => void};

type Props = {
  keybindings?: {[ keyCode: string ]: (KeyboardEvent) => void},
  handlers?: HandlersMap,
};

export default class EventManager extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    this.handlers = {};
  }

  componentWillMount() {
    document.addEventListener('keydown', this.handleKeyDown, { capture: true });
    this.bindHandlers(this.props.handlers);
  }

  componentDidUpdate(prevProps: Props) {
    this.unbindHandlers(prevProps.handlers);
    this.bindHandlers(this.props.handlers);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown, { capture: true });
    this.unbindHandlers(this.props.handlers);
  }

  bindHandlers(handlers: ?HandlersMap) {
    Object.keys(handlers || {}).forEach((handler: string) => {
      const newHandler = (e: Event) => this.handleCustomEvent(handler, e);
      document.addEventListener(handler, newHandler, { passive: true });
      this.handlers[handler] = newHandler;
    });
  }

  unbindHandlers(handlers: ?HandlersMap) {
    Object.keys(handlers || {}).forEach((handler: string) => {
      if (handler in this.handlers) {
        document.removeEventListener(handler, this.handlers[handler], { passive: true });
        delete this.handlers[handler];
      }
    });
  }

  handleCustomEvent(handler: string, e: Event) {
    const { handlers } = this.props;
    if (handlers && handler in handlers) {
      if (e.detail) {
        handlers[handler](e.detail);
      } else {
        handlers[handler]();
      }
    }
  }

  handlers: {[ event: string ]: (Event) => void};
  handleKeyDown = (e: KeyboardEvent) => {
    const matchedKeybind = Object.keys(this.props.keybindings || {}).find((keybind: string) => {
      const parts = keybind.split('+');
      const [key] = parts.slice(-1);
      const modifiers = parts.slice(0, -2);
      const modsValid = modifiers.every((mod) => {
        switch (mod.toLowerCase()) {
          case 'ctrl':
            return e.ctrlKey;
          case 'alt':
            return e.altKey;
          case 'meta':
            return e.metaKey;
          case 'shift':
            return e.shiftKey;
          default:
            return false;
        }
      });

      if (modsValid && e.key.toLowerCase() === key.toLowerCase()) {
        return true;
      }
      return false;
    });

    if (matchedKeybind && this.props.keybindings) {
      this.props.keybindings[matchedKeybind](e);
      e.preventDefault();
    }
  }

  render() {
    return null;
  }
}
