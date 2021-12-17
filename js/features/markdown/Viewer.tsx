// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import rehypeRaw from 'rehype-raw';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';

import { Box } from '@mui/material';

import { directivePlugin } from './Directive';
import autoLink from './autoLink';
import {
  Paragraph,
  MaybeDirective,
  QuoteDirective,
  TableRoot,
  THead,
  TBody,
  TR,
  TC,
  Heading,
  Anchor,
} from './components';
import { checkboxPlugin, stripEmptyBackslash } from './remark';

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
        p: Paragraph,
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
        a: Anchor,
      }}
      remarkPlugins={[
        remarkGfm,
        checkboxPlugin,
        remarkDirective,
        directivePlugin,
        stripEmptyBackslash,
        [autoLink, { titles }],
      ]}
      rehypePlugins={[rehypeRaw]}
    >
      {children}
    </ReactMarkdown>
  </Box>
);

export default Markdown;
