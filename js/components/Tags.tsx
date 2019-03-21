// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import * as React from 'react';

import Chip from '@material-ui/core/Chip';
import { withStyles, createStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';

const styles = (theme: Theme) => createStyles({
  chip: {
    marginRight: theme.spacing.unit,
  },
});

type TagProps = {
  classes: any,
  tag: string,
}

const Tag = withStyles(styles)((props: TagProps) => {
  const { classes } = props;

  return <Chip label={props.tag} className={classes.chip} />;
});

type TagsProps = {
  tags: string[]
};

export default function Tags(props: TagsProps) {
  if (props.tags.length == 0) {
    return null;
  }

  return (
    <div>
      {props.tags.map(t => (
        <Tag key={t} tag={t} />
      ))}
    </div>
  );
}
