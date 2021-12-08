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
  children?: React.ReactNode | React.ReactNode[];
};

const BindKeyboard = ({ keys, action, callback, children }: Props) => {
  const mainRef = React.useRef<HTMLDivElement>();
  const mousetrapRef = React.useRef<Mousetrap.MousetrapInstance | Mousetrap.MousetrapStatic>(null);

  React.useEffect(() => {
    if (mainRef.current || !children) {
      if (mousetrapRef.current) {
        mousetrapRef.current.unbind(keys, action);
      }

      if (children) {
        mousetrapRef.current = new Mousetrap(mainRef.current);
      } else {
        mousetrapRef.current = Mousetrap;
      }

      mousetrapRef.current.bind(keys, callback, action);
    }

    return () => {
      if (mousetrapRef.current) {
        mousetrapRef.current.unbind(keys, action);
      }
    };
  }, [mainRef.current, children, callback]);

  if (children) {
    return <div ref={mainRef}>{children}</div>;
  }
  return null;
};

export default BindKeyboard;
