// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//

/* eslint-disable react/jsx-props-no-spreading */
import rehypeRaw from 'rehype-raw';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

import AutoLink from 'components/note/AutoLink';

import Directive, { directivePlugin } from './Directive';
import * as styles from './styles.scss';

const BrOrAutolink =
  (titles: { [title: string]: Set<number> }) =>
  ({ children, node: _node, ...props }: any) => {
    if (
      children === '\\' ||
      (Array.isArray(children) && children.length > 0 && children[0] === '\\')
    ) {
      return <p {...props} />;
    }
    return (
      <p {...props}>
        <AutoLink titles={titles}>{children}</AutoLink>
      </p>
    );
  };

const MaybeDirective = ({ children, node: _node, ...props }: any) => {
  if ('data-directive-type' in props && 'data-type' in props) {
    return (
      <Directive
        // eslint-disable-next-line react/prop-types
        type={(props as any)['data-type']!}
      >
        {children}
      </Directive>
    );
  }
  return <div {...props}>{children}</div>;
};

const QuoteDirective = ({ children }: any) => <Directive type='blockquote'>{children}</Directive>;

const TableRoot = ({ children, node: _node, ...props }: any) => (
  <TableContainer>
    <Table {...props}>{children}</Table>
  </TableContainer>
);

const THead = ({ children, node: _node, ...props }: any) => (
  <TableHead {...props}>{children}</TableHead>
);

const TBody = ({ children, node: _node, ...props }: any) => (
  <TableBody
    sx={{
      '@media print': {
        '& tr:nth-of-type(2n + 1)': {
          backgroundColor: '#e0e5c1',
        },
      },
    }}
    {...props}
  >
    {children}
  </TableBody>
);

// Remove isHeader from props to avoid weird react rendering error...
const TR = ({ children, node: _node, isHeader: _isHeader, ...props }: any) => (
  <TableRow {...props}>{children}</TableRow>
);

// Remove isHeader from props to avoid weird react rendering error...
const TC = ({ children, node: _node, isHeader: _isHeader, ...props }: any) => (
  <TableCell
    sx={{ '@media print': { color: 'black', borderBottom: 'none', padding: 1 } }}
    {...props}
  >
    {children}
  </TableCell>
);

interface Props {
  children: string;
  titles?: { [title: string]: Set<number> };
}

const Markdown = ({ children, titles = {} }: Props) => (
  <ReactMarkdown
    className={styles.markdown}
    components={{
      p: BrOrAutolink(titles),
      div: MaybeDirective,
      blockquote: QuoteDirective,
      table: TableRoot,
      thead: THead,
      tbody: TBody,
      tr: TR,
      td: TC,
      th: TC,
    }}
    remarkPlugins={[remarkGfm, remarkDirective, directivePlugin]}
    rehypePlugins={[rehypeRaw]}
  >
    {children}
  </ReactMarkdown>
);

export default Markdown;
