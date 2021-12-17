// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//

/* eslint-disable react/jsx-props-no-spreading */
import * as React from 'react';
import type { HeadingProps } from 'react-markdown/lib/ast-to-react';
import { Link as RouterLink } from 'react-router-dom';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Link as MuiLink,
} from '@mui/material';

import Directive from './Directive';

export const MaybeDirective = ({ children, node: _node, ...props }: any) => {
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

export const QuoteDirective = ({ children }: any) => (
  <Directive type='blockquote'>{children}</Directive>
);

export const TableRoot = ({ children, node: _node, ...props }: any) => (
  <TableContainer>
    <Table {...props}>{children}</Table>
  </TableContainer>
);

export const THead = ({ children, node: _node, ...props }: any) => (
  <TableHead {...props}>{children}</TableHead>
);

export const TBody = ({ children, node: _node, ...props }: any) => (
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

export const TR = ({ children, node: _node, isHeader: _isHeader, ...props }: any) => (
  <TableRow {...props}>{children}</TableRow>
);

export const TC = ({ children, node: _node, isHeader: _isHeader, ...props }: any) => (
  <TableCell
    sx={{ '@media print': { color: 'black', borderBottom: 'none', padding: 1 } }}
    {...props}
  >
    {children}
  </TableCell>
);

export const Paragraph = ({ children, node: _node, ...props }: any) => (
  <Typography component='p' variant='body' {...props}>
    {children}
  </Typography>
);

export const Heading = ({
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

export const Anchor = ({ children, node: _node, href, ...props }: any) => (
  <MuiLink underline='hover' color='secondary' component={RouterLink} to={href} {...props}>
    {children}
  </MuiLink>
);
