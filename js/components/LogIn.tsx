// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import * as React from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { Dispatch } from 'redux';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { UserData, AppState } from 'data/types';
import { logIn, fetchData } from 'data/actions';

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
    e.preventDefault();

    let result;
    if (this.state.signing_in) {
      result = await axios.post('/api/sign_in', {
        email: this.state.email,
        password: this.state.password,
      });
    } else {
      result = await axios.put('/api/sign_up', {
        email: this.state.email,
        password: this.state.password,
        name: this.state.name,
      });
    }

    this.setState(initialState);
    this.props.logIn(result.data);
  };

  render() {
    return (
      <Dialog open={this.props.open}>
        <DialogTitle>
          {this.state.signing_in ? 'Sign In' : 'Sign Up'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            To use Noted, you must sign in.{' '}
            <a
              href='#'
              onClick={e => {
                e.preventDefault();
                this.setState({ signing_in: !this.state.signing_in });
              }}
            >
              {this.state.signing_in ? 'Sign Up' : 'Sign In'}
            </a>{' '}
            instead.
          </DialogContentText>
          <form onSubmit={this.signInOrUp}>
            {this.state.signing_in ? null : (
              <TextField
                margin='dense'
                id='name'
                label='Name'
                type='text'
                value={this.state.name}
                onChange={e => this.setState({ name: e.target.value })}
                fullWidth
              />
            )}
            <TextField
              margin='dense'
              id='name'
              label='Email Address'
              type='email'
              value={this.state.email}
              onChange={e => this.setState({ email: e.target.value })}
              fullWidth
            />
            <TextField
              margin='dense'
              id='name'
              label='Password'
              type='password'
              value={this.state.password}
              onChange={e => this.setState({ password: e.target.value })}
              fullWidth
            />
            <input
              type='submit'
              value='Submit'
              style={{ visibility: 'hidden' }}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.signInOrUp} color='primary'>
            {this.state.signing_in ? 'Sign In' : 'Sign Up'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

const mapStateToProps = (state: AppState) => ({});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  logIn(user: UserData) {
    dispatch(logIn(user));
    fetchData(dispatch);
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LogIn);
