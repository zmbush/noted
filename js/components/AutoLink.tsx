// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import * as React from 'react';

type LinkProps = {
  text: string;
  ids: Set<number>;
};

class LinkedText extends React.Component<LinkProps> {
  render() {
    return <span style={{ color: 'red' }}>{this.props.text}</span>;
  }
}

type Props = {
  titles: Map<string, Set<number>>;
  children: string;
};

export default class AutoLink extends React.Component<Props> {
  render() {
    let body: any[] = [this.props.children];
    let keyIx = 1;

    this.props.titles.forEach((value, key) => {
      let newBody: any[] = [];
      for (let part of body) {
        if (typeof part == 'string' || part instanceof String) {
          let elements = part.split(key).reduce((r, a, ix, arr) => {
            r.push(a);
            if (ix + 1 < arr.length) {
              r.push(
                <LinkedText
                  key={`linked-text-${keyIx++}`}
                  text={key}
                  ids={value}
                />
              );
            }
            return r;
          }, []);
          newBody = newBody.concat(elements);
        } else {
          newBody.push(part);
        }
      }
      body = newBody;
    });

    return body;
  }
}
