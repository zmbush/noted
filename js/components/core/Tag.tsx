// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import * as React from 'react';

import { Gesture as GestureIcon, Grade as GradeIcon } from '@mui/icons-material';
import { PropTypes, Chip, ChipProps } from '@mui/material';

interface Props extends ChipProps {
  label: string;
}

const Tag = (props: Props) => {
  const { label: tag, ...otherProps } = props;

  const parts = (tag || '').split(':');
  const chipSx = { marginRight: 1 };

  if (parts.length === 1) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Chip label={parts[0]} sx={chipSx} {...otherProps} />;
  }
  const type = parts[0];
  const label = parts.slice(1).join(':');
  let Icon = null;
  let color: PropTypes.Color;
  switch (type) {
    case 'arc':
      Icon = GestureIcon;
      color = 'secondary';
      break;
    case 'type':
      Icon = GradeIcon;
      color = 'primary';
      break;
    default:
      color = 'primary';
      break;
  }
  if (Icon) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Chip label={label} color={color} sx={chipSx} icon={<Icon />} {...otherProps} />;
  }
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Chip label={label} color={color} sx={chipSx} {...otherProps} />;
};

export default Tag;
