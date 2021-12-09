// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { h } from 'hastscript';
import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';

import * as React from 'react';

import { Alert } from '@mui/material';

export const directivePlugin = () => (tree: Root) => {
  visit(tree, (node) => {
    if (
      node.type === 'textDirective' ||
      node.type === 'leafDirective' ||
      node.type === 'containerDirective'
    ) {
      if (!(node.name === 'tip' || node.name === 'warning' || node.name === 'info')) {
        return;
      }
      // eslint-disable-next-line no-param-reassign
      const data = node.data || (node.data = {});

      data.hName = 'div';
      data.hProperties = {
        ...h('div', node.attributes).properties,
        'data-directive-type': node.type === 'textDirective' ? 'text' : 'block',
        'data-type': node.name,
      };
    }
  });
};

interface Props {
  type: string;
  children: React.ReactNode | React.ReactNode[];
}

export const getSeverity = (type: string): 'info' | 'warning' | 'success' | 'error' => {
  switch (type) {
    case 'info':
      return 'info';
    case 'warning':
      return 'warning';
    case 'tip':
      return 'success';
    default:
      return 'error';
  }
};

const Directive = ({ type, children }: Props) => (
  <Alert
    severity={getSeverity(type)}
    sx={{
      marginTop: 1,
      marginBottom: 1,
      '& p:first-of-type': { marginTop: 0 },
      '& p:last-of-type': { marginBottom: 0 },
    }}
  >
    {children}
  </Alert>
);

export default Directive;
