// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';

export const checkboxPlugin = () => (tree: Root) => {
  visit(tree, (node) => {
    if (node.type === 'listItem') {
      if (node.checked) {
        // eslint-disable-next-line no-param-reassign
        const data = node.data || (node.data = {});
        data.hProperties = {
          class: 'checked task-list-item',
        };
      }
    }
  });
};

export const stripEmptyBackslash = () => (tree: Root) => {
  visit(tree, (node) => {
    if (
      'children' in node &&
      node.children &&
      node.children.length === 1 &&
      node.children[0].type === 'text' &&
      node.children[0].value === '\\'
    ) {
      // eslint-disable-next-line no-param-reassign
      node.children = [];
    }
  });
};
