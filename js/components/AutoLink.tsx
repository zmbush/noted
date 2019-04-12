// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import * as React from 'react';
import { Link } from 'react-router-dom';
import { NoteData } from 'data/types';

export function parseTitles(notes: Map<number, NoteData>) {
  return Array.from(notes.values()).reduce(
    (titles, note: { title: string; id: number }) => {
      titles.set(note.title, new Set([note.id]));
      for (let titlePart of note.title.split(' ')) {
        if (titlePart.length > 3) {
          if (titles.has(titlePart)) {
            titles.get(titlePart).add(note.id);
          } else {
            titles.set(titlePart, new Set([note.id]));
          }
        }
      }
      return titles;
    },
    new Map<string, Set<number>>()
  );
}

type LinkProps = {
  text: string;
  ids: Set<number>;
};

class LinkedText extends React.Component<LinkProps> {
  render() {
    if (this.props.ids.size == 1) {
      const id = this.props.ids.values().next().value;
      return <Link to={`/note/${id}`}>{this.props.text}</Link>;
    } else if (this.props.ids.size > 1) {
      const ids = Array.from(this.props.ids.values()).join(',');
      return <Link to={`/disambiguation/${ids}`}>{this.props.text}</Link>;
    } else {
      return this.props.text;
    }
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
          let elements = part
            .split(new RegExp(key, 'i'))
            .reduce((r, a, ix, arr) => {
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