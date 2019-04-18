// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import * as React from 'react';
import { useState, useEffect, Component } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import axios from 'axios';
import * as Fuse from 'fuse.js';
import classNames from 'classnames';

import * as PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import HomeIcon from '@material-ui/icons/Home';
import Typography from '@material-ui/core/Typography';
import { withStyles, createStyles, WithStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import InputBase from '@material-ui/core/InputBase';
import { fade } from '@material-ui/core/styles/colorManipulator';
import Button from '@material-ui/core/Button';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import {
  withRouter,
  Route,
  Switch,
  RouteComponentProps,
} from 'react-router-dom';

import Note, { InnerNote } from 'components/Note';
import BindKeyboard from 'components/BindKeyboard';
import NoteList from 'components/NoteList';
import { updateNote, logOut } from 'data/actions';
import { NoteData, AppState } from 'data/types';
import { getLinkIds, LinkIdMap } from 'data/selectors';
import FilteredNoteList from 'components/FilteredNoteList';
import LogIn from 'components/LogIn';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      '@media print': {
        overflow: 'visible !important',
        columnCount: 2,
        columnWidth: 200,
        //columnBreakInside: 'avoid',
      },
    },
    grow: {
      flexGrow: 1,
    },
    menuButton: {
      marginLeft: -12,
      marginRight: 20,
    },
    contentRoot: {
      '@media print': {
        marginTop: 0,
        display: 'block',
      },
      marginTop: 75,
    },
    title: {
      display: 'none',
      [theme.breakpoints.up('sm')]: {
        display: 'block',
      },
    },
    search: {
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: fade(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: fade(theme.palette.common.white, 0.25),
      },
      marginLeft: 0,
      marginRight: theme.spacing.unit,
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing.unit,
        width: 'auto',
      },
    },
    searchIcon: {
      width: theme.spacing.unit * 9,
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputRoot: {
      color: 'inherit',
      width: '100%',
    },
    inputInput: {
      paddingTop: theme.spacing.unit,
      paddingRight: theme.spacing.unit,
      paddingBottom: theme.spacing.unit,
      paddingLeft: theme.spacing.unit * 10,
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        width: 120,
        '&:focus': {
          width: 200,
        },
      },
    },
    newButton: {
      margin: theme.spacing.unit,
    },
    leftIcon: {
      marginRight: theme.spacing.unit,
    },
    iconSmall: {
      fontSize: 20,
    },
    noPrint: {
      '@media print': {
        display: 'none',
      },
    },
  });

const initialState = {
  search: '',
  newNote: false,
  userMenuEl: null as HTMLElement,
};

type State = Readonly<typeof initialState>;

interface Props extends WithStyles<typeof styles>, RouteComponentProps {
  notes: Map<number, NoteData>;
  titles: LinkIdMap;
  is_signed_in: boolean;
  updateNote: (note: NoteData) => void;
  logOut: () => void;
}

class App extends Component<Props, State> {
  searchInput: React.RefObject<HTMLInputElement>;
  firstNote: React.RefObject<InnerNote>;
  newNote: React.RefObject<InnerNote>;

  constructor(props: Props) {
    super(props);

    this.state = initialState;
    this.searchInput = React.createRef();
    this.firstNote = React.createRef();
    this.newNote = React.createRef();
  }

  componentDidMount() {
    document.title = `noted`;
  }

  updateNote = (note?: NoteData) => {
    if (note) {
      this.props.updateNote(note);
    }
    this.setState({ newNote: false });
  };

  startSearch = (e: Event) => {
    e.preventDefault();
    this.searchInput.current.focus();
  };

  startEdit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (this.firstNote.current) {
      this.firstNote.current.startEdit();
    } else {
      this.createNew(e);
    }
  };

  create() {
    this.setState({ newNote: true }, () => {
      if (this.newNote.current) {
        this.newNote.current.startEdit();
      }
    });
  }

  createNew = (e: React.SyntheticEvent) => {
    e.preventDefault();
    this.create();
  };

  createNewShortcut = (e: ExtendedKeyboardEvent, combo: string) => {
    e.preventDefault();
    this.create();
  };

  closeUserMenu = () => {
    this.setState({ userMenuEl: null });
  };

  openUserMenu = (e: React.MouseEvent<HTMLElement>) => {
    this.setState({ userMenuEl: e.currentTarget });
  };

  signOut = async (e: React.SyntheticEvent) => {
    this.setState({ userMenuEl: null });
    await axios.post('/api/sign_out');
    this.props.logOut();
  };

  render() {
    const { userMenuEl } = this.state;
    const { classes } = this.props;
    const isUserMenuOpen = Boolean(userMenuEl);

    return (
      <div className={classes.root}>
        <AppBar className={classes.noPrint}>
          <Toolbar>
            <Switch>
              <Route exact path='/'>
                <IconButton
                  className={classes.menuButton}
                  aria-label='Menu'
                  color='inherit'
                >
                  <MenuIcon />
                </IconButton>
              </Route>
              <Route>
                <IconButton
                  className={classes.menuButton}
                  aria-label='Menu'
                  color='inherit'
                  onClick={() => {
                    this.props.history.push('/');
                  }}
                >
                  <HomeIcon />
                </IconButton>
              </Route>
            </Switch>
            <Typography
              className={classes.title}
              variant='h6'
              color='inherit'
              noWrap
            >
              Noted
            </Typography>
            <div className={classes.grow} />
            <BindKeyboard keys='ctrl+o' callback={this.createNewShortcut}>
              <div className={classes.search}>
                <div className={classes.searchIcon}>
                  <SearchIcon />
                </div>
                <form onSubmit={this.startEdit}>
                  <InputBase
                    inputProps={{
                      ref: this.searchInput,
                    }}
                    placeholder='Search...'
                    classes={{
                      root: classes.inputRoot,
                      input: classes.inputInput,
                    }}
                    value={this.state.search}
                    onChange={e => this.setState({ search: e.target.value })}
                  />
                </form>
              </div>
            </BindKeyboard>
            <IconButton
              aria-haspopup='true'
              onClick={this.openUserMenu}
              color='inherit'
            >
              <AccountCircle />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Grid container spacing={16} className={classes.contentRoot}>
          {this.state.newNote ? (
            <Grid item xs={12}>
              <Note
                new
                innerRef={this.newNote}
                note={{
                  id: -1,
                  title: this.state.search,
                  tags: [],
                  body: '',
                  created_at: '',
                  updated_at: '',
                  user_id: 0,
                }}
                updateNote={this.updateNote}
                titles={new Map()}
              />
            </Grid>
          ) : null}
          <Switch>
            <Route exact path='/'>
              <NoteList
                notes={this.props.notes}
                titles={this.props.titles}
                search={this.state.search}
                updateNote={this.updateNote}
                firstNoteRef={this.firstNote}
              />
            </Route>
            <Route path={['/note/:ids', '/disambiguation/:ids']}>
              <FilteredNoteList
                notes={this.props.notes}
                titles={this.props.titles}
                search={this.state.search}
                updateNote={this.updateNote}
                firstNoteRef={this.firstNote}
              />
            </Route>
          </Switch>
        </Grid>

        <BindKeyboard keys='/' callback={this.startSearch} />
        <LogIn open={!this.props.is_signed_in} />
        <Menu
          anchorEl={this.state.userMenuEl}
          open={isUserMenuOpen}
          onClose={this.closeUserMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <MenuItem onClick={this.signOut}>
            <p>Sign Out</p>
          </MenuItem>
        </Menu>
      </div>
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  notes: state.notes,
  titles: getLinkIds(state.notes),
  is_signed_in: state.user.is_signed_in,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateNote(data: NoteData) {
    dispatch(updateNote(data));
  },

  logOut() {
    dispatch(logOut());
  },
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(App))
);
