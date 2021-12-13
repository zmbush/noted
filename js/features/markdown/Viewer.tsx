// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//

/* eslint-disable react/jsx-props-no-spreading */
import type { Root } from 'mdast';
import rehypeRaw from 'rehype-raw';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import type { HeadingProps } from 'react-markdown/lib/ast-to-react';

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import AutoLink from './AutoLink';
import Directive, { directivePlugin } from './Directive';

const BrOrAutolink =
  (titles: { [title: string]: Set<number> }) =>
  ({ children, node: _node, ...props }: any) => {
    if (
      children === '\\' ||
      (Array.isArray(children) && children.length > 0 && children[0] === '\\')
    ) {
      return <Typography variant='body1' {...props} />;
    }
    return (
      <Typography variant='body1' {...props}>
        <AutoLink titles={titles}>{children}</AutoLink>
      </Typography>
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

const TR = ({ children, node: _node, isHeader: _isHeader, ...props }: any) => (
  <TableRow {...props}>{children}</TableRow>
);

const TC = ({ children, node: _node, isHeader: _isHeader, ...props }: any) => (
  <TableCell
    sx={{ '@media print': { color: 'black', borderBottom: 'none', padding: 1 } }}
    {...props}
  >
    {children}
  </TableCell>
);

const Heading = ({
  children,
  node: _node,
  level,
  ref: _ref,
  ...props
}: Omit<HeadingProps, 'level'> & { level: 1 | 2 | 3 | 4 }) => {
  const l = (level + 1) as 2 | 3 | 4 | 5;
  return (
    <Typography variant={`h${l}`} {...props}>
      {children}
    </Typography>
  );
};

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
interface Props {
  children: string;
  titles?: { [title: string]: Set<number> };
}

const Markdown = ({ children, titles = {} }: Props) => (
  <Box
    sx={(theme) => ({
      marginTop: 2,
      '& .contains-task-list': {
        paddingLeft: 0,
        '& li': {
          listStyle: 'none',
          '&.checked': {
            textDecoration: 'line-through',
          },
        },
      },
      '@media print': {
        paddingLeft: 2,
        '& p': {
          textIndent: theme.spacing(1),
        },
        '& a': {
          textDecoration: 'none',
          color: 'black',
        },
        '& h2, & h3, & h4, &h5': {
          color: '#58180d',
        },
        '& h2': {
          fontSize: '0.705cm',
        },
        '& h3': {
          fontSize: '0.529cm',
          borderBottom: '2px solid #c0ad7a',
        },
        '& h4': {
          fontSize: '0.458cm',
          marginBottom: 0,
        },
        '& h5': {
          fontSize: '0.423cm',
          marginBottom: '0.2em',
        },
      },
    })}
  >
    <ReactMarkdown
      disallowedElements={['h5', 'h6']}
      unwrapDisallowed
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
        h1: Heading,
        h2: Heading,
        h3: Heading,
        h4: Heading,
      }}
      remarkPlugins={[remarkGfm, checkboxPlugin, remarkDirective, directivePlugin]}
      rehypePlugins={[rehypeRaw]}
    >
      {children}
    </ReactMarkdown>
  </Box>
);

export default Markdown;
