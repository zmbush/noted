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

import Directive, { directivePlugin } from 'components/core/Directive';
import AutoLink from 'components/note/AutoLink';

const BrOrAutolink =
  (titles: { [title: string]: Set<number> }) =>
  ({ children, ...props }: any) => {
    if (
      children === '\\' ||
      (Array.isArray(children) && children.length > 0 && children[0] === '\\')
    ) {
      return <br />;
    }
    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <p {...props}>
        <AutoLink titles={titles}>{children}</AutoLink>
      </p>
    );
  };

const MaybeDirective = ({ children, ...props }: any) => {
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
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <div {...props}>{children}</div>;
};

interface Props {
  children: string;
  className?: string;
  titles?: { [title: string]: Set<number> };
}

const Markdown = ({ children, className, titles = {} }: Props) => (
  <ReactMarkdown
    className={className}
    components={{
      p: BrOrAutolink(titles),
      div: MaybeDirective,
    }}
    remarkPlugins={[remarkGfm, remarkDirective, directivePlugin]}
    rehypePlugins={[rehypeRaw]}
  >
    {children}
  </ReactMarkdown>
);

export default Markdown;
