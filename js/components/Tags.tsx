// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
import * as React from 'react';

import { Gesture as GestureIcon, Grade as GradeIcon } from '@mui/icons-material';
import { PropTypes, Chip } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

const styles = (theme: Theme) =>
  createStyles({
    chip: {
      marginRight: theme.spacing(1),
    },
  });

interface TagProps extends WithStyles<typeof styles> {
  tag: string;
}

const Tag = withStyles(styles)((props: TagProps) => {
  const { classes, tag } = props;

  const parts = tag.split(':');

  if (parts.length === 1) {
    return <Chip label={parts[0]} className={classes.chip} />;
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
    default:
      Icon = GradeIcon;
      color = 'primary';
      break;
  }
  if (Icon) {
    return <Chip label={label} color={color} className={classes.chip} icon={<Icon />} />;
  }
  return <Chip label={label} color={color} className={classes.chip} />;
});

const tagsStyles = (_theme: Theme) =>
  createStyles({
    noPrint: {
      '@media print': {
        display: 'none',
      },
    },
  });

interface TagsProps extends WithStyles<typeof tagsStyles> {
  tags: string[];
}

const Tags = (props: TagsProps) => {
  const { classes, tags } = props;
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={classes.noPrint}>
      {tags.map((t) => (
        <Tag key={t} tag={t} />
      ))}
    </div>
  );
};

export default withStyles(tagsStyles)(Tags);
