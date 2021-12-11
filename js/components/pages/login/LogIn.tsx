// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import * as React from 'react';
import { useDispatch } from 'react-redux';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';

import { signInUser, signUpUser } from 'data/user/api';

type LogInProps = {
  open: boolean;
};

const LogIn = ({ open }: LogInProps) => {
  const dispatch = useDispatch();
  const [signingIn, setSigningIn] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');

  const signInOrUp = (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (signingIn) {
      dispatch(signInUser({ email, password }));
    } else {
      dispatch(signUpUser({ email, password, name }));
    }
  };

  return (
    <Dialog open={open}>
      <DialogTitle>{signingIn ? 'Sign In' : 'Sign Up'}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To use Noted, you must sign in. {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            href='#'
            onClick={(e) => {
              e.preventDefault();
              setSigningIn(!signingIn);
            }}
          >
            {signingIn ? 'Sign Up' : 'Sign In'}
          </a>{' '}
          instead.
        </DialogContentText>
        <form onSubmit={signInOrUp}>
          {signingIn ? null : (
            <TextField
              margin='dense'
              id='name'
              label='Name'
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
          )}
          <TextField
            inputProps={{ 'data-testid': 'email' }}
            margin='dense'
            id='name'
            label='Email Address'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <TextField
            inputProps={{ 'data-testid': 'password' }}
            margin='dense'
            id='name'
            label='Password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />
          <input type='submit' value='Submit' style={{ visibility: 'hidden' }} />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={signInOrUp} color='primary'>
          {signingIn ? 'Sign In' : 'Sign Up'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogIn;
