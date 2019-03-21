// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import React from 'react';

import Chip from '@material-ui/core/Chip';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  chip: {
    marginRight: theme.spacing.unit,
  },
});

const Tag = withStyles(styles)(props => {
  const { classes } = props;

  return <Chip label={props.tag} className={classes.chip} />;
});

export default function Tags(props) {
  const { classes } = props;

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
