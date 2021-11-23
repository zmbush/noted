// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
import * as React from 'react';

import Button from '@material-ui/core/Button';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

interface Props extends DialogProps {
  message?: string;
  negative?: string;
  positive?: string;
  onNegative?: () => void;
  onPositive?: () => void;
}

// eslint-disable-next-line react/prefer-stateless-function
export default class ConfirmationDialog extends React.Component<Props> {
  static defaultProps = {
    message: 'Are you sure?',
    negative: 'No',
    positive: 'Yes',
    onNegative: () => {},
    onPositive: () => {},
  };

  render() {
    const { title, message, negative, onNegative, positive, onPositive, ...other } = this.props;
    return (
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        maxWidth='xs'
        aria-labelledby='confirmation-dialog-title'
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...other}
      >
        <DialogTitle id='confirmation-dialog-title'>{title}</DialogTitle>
        <DialogContent>{message}</DialogContent>
        <DialogActions>
          <Button onClick={onNegative} color='primary'>
            {negative}
          </Button>
          <Button onClick={onPositive} color='primary'>
            {positive}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
