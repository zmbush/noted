// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
import axios from 'axios';
import { Dispatch } from 'redux';

import * as React from 'react';
import { connect } from 'react-redux';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';

import { logIn, fetchData } from 'data/actions';
import { UserData, AppState } from 'data/types';

type LogInProps = {
  open: boolean;
  logIn: (user: UserData) => void;
};

const initialState = {
  signing_in: true,
  email: '',
  password: '',
  name: '',
};

type LogInState = typeof initialState;

class LogIn extends React.Component<LogInProps, LogInState> {
  constructor(props: LogInProps) {
    super(props);

    this.state = initialState;
  }

  signInOrUp = async (e: React.SyntheticEvent) => {
    const { logIn: doLogIn } = this.props;
    const { signing_in: signingIn, email, password, name } = this.state;
    e.preventDefault();

    let result;
    if (signingIn) {
      result = await axios.post('/api/sign_in', {
        email,
        password,
      });
    } else {
      result = await axios.put('/api/sign_up', {
        email,
        password,
        name,
      });
    }

    this.setState(initialState);
    doLogIn(result.data);
  };

  render() {
    const { open } = this.props;
    const { signing_in: signingIn, name, email, password } = this.state;
    return (
      <Dialog open={open}>
        <DialogTitle>{signingIn ? 'Sign In' : 'Sign Up'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To use Noted, you must sign in.{' '}
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a
              href='#'
              onClick={(e) => {
                e.preventDefault();
                this.setState({ signing_in: !signingIn });
              }}
            >
              {signingIn ? 'Sign Up' : 'Sign In'}
            </a>{' '}
            instead.
          </DialogContentText>
          <form onSubmit={this.signInOrUp}>
            {signingIn ? null : (
              <TextField
                margin='dense'
                id='name'
                label='Name'
                type='text'
                value={name}
                onChange={(e) => this.setState({ name: e.target.value })}
                fullWidth
              />
            )}
            <TextField
              margin='dense'
              id='name'
              label='Email Address'
              type='email'
              value={email}
              onChange={(e) => this.setState({ email: e.target.value })}
              fullWidth
            />
            <TextField
              margin='dense'
              id='name'
              label='Password'
              type='password'
              value={password}
              onChange={(e) => this.setState({ password: e.target.value })}
              fullWidth
            />
            <input type='submit' value='Submit' style={{ visibility: 'hidden' }} />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.signInOrUp} color='primary'>
            {signingIn ? 'Sign In' : 'Sign Up'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

const mapStateToProps = (_state: AppState) => ({});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  logIn(user: UserData) {
    dispatch(logIn(user));
    fetchData(dispatch);
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(LogIn);
