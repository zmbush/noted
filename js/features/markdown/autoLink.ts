// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
import type { Root, Link } from 'mdast';
import { visit } from 'unist-util-visit';

const autoLink =
  ({ titles }: { titles: { [title: string]: Set<number> } }) =>
  (tree: Root) => {
    visit(tree, (node) => {
      if ('children' in node && node.children && node.children.length > 0) {
        let changed = false;
        let body = node.children;
        Object.entries(titles).forEach(([key, value]) => {
          let newBody: any[] = [];
          body.forEach((part) => {
            if (part.type !== 'text') {
              newBody.push(part);
              return;
            }
            const elements = part.value.split(new RegExp(key, 'i')).reduce((r, a, ix, arr) => {
              changed = true;
              if (a !== '') {
                r.push({ type: 'text', value: a });
              }
              if (ix + 1 < arr.length) {
                const newNode: Link = {
                  type: 'link',
                  url: '/',
                  children: [{ type: 'text', value: key }],
                };
                if (value.size === 1) {
                  newNode.url = `/note/${[...value][0]}`;
                } else {
                  newNode.url = `/disambiguation/${[...value].join(',')}`;
                }
                r.push(newNode);
              }
              return r;
            }, [] as Root['children']);
            newBody = newBody.concat(elements);
          });
          body = newBody;
        });
        if (changed) {
          // eslint-disable-next-line no-param-reassign
          node.children = body;
          return 'skip';
        }
      }
      return true;
    });
  };

export default autoLink;
