// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
import * as React from 'react';
import { Link } from 'react-router-dom';

type LinkProps = {
  text: string;
  ids: Set<number>;
};

export const LinkedText = ({ ids, text }: LinkProps) => {
  if (ids.size === 1) {
    const id = ids.values().next().value;
    return <Link to={`/note/${id}`}>{text}</Link>;
  }
  if (ids.size > 1) {
    const theseIds = Array.from(ids.values()).join(',');
    return <Link to={`/disambiguation/${theseIds}`}>{text}</Link>;
  }
  return text as any as React.ReactElement;
};
LinkedText.displayName = 'LinkedText';

type Props = {
  titles: { [title: string]: Set<number> };
  children: (React.ReactNode & React.ReactNode[]) | string;
};

const AutoLink = ({ children, titles }: Props) => {
  let body: React.ReactNode[] = [];
  if (!(children instanceof Array)) {
    body = [children];
  } else {
    body = children;
  }
  let keyIx = 1;

  Object.entries(titles).forEach(([key, value]) => {
    let newBody: any[] = [];
    body.forEach((part) => {
      if (typeof part === 'string' || part instanceof String) {
        const elements = part.split(new RegExp(key, 'i')).reduce((r, a, ix, arr) => {
          r.push(a);
          if (ix + 1 < arr.length) {
            r.push(<LinkedText key={`linked-text-${keyIx}`} text={key} ids={value} />);
            keyIx += 1;
          }
          return r;
        }, [] as (string | React.ReactElement)[]);
        newBody = newBody.concat(elements);
      } else {
        newBody.push(part);
      }
    });
    body = newBody;
  });

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{body}</>;
};

export default AutoLink;