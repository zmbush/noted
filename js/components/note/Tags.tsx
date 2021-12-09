// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
import * as React from 'react';

import { styled } from '@mui/material';

import Tag from 'components/core/Tag';

type TagsProps = {
  tags: string[];
};

const TagsRoot = styled('div')({
  '@media print': {
    display: 'none',
  },
});

const Tags = (props: TagsProps) => {
  const { tags } = props;
  if (tags.length === 0) {
    return null;
  }

  return (
    <TagsRoot>
      {tags.map((t) => (
        <Tag key={t} label={t} />
      ))}
    </TagsRoot>
  );
};

export default Tags;
