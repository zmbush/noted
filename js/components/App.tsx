// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import axios from 'axios';
import Mousetrap from 'mousetrap';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import HomeIcon from '@material-ui/icons/Home';
import Typography from '@material-ui/core/Typography';
import { withStyles, createStyles, WithStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import debounce from 'debounce-promise';

import { withRouter, Route, Switch, RouteComponentProps } from 'react-router-dom';

import Note, { InnerNote } from 'components/Note';
import BindKeyboard from 'components/BindKeyboard';
import NoteList from 'components/NoteList';
import { updateNote, deleteNote, logOut } from 'data/actions';
import { NoteData, AppState } from 'data/types';
import { getTopLevelNotes } from 'data/selectors';
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
        // columnBreakInside: 'avoid',
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
      marginRight: theme.spacing(1),
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
      },
    },
    searchIcon: {
      width: theme.spacing(9),
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
      paddingTop: theme.spacing(1),
      paddingRight: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      paddingLeft: theme.spacing(10),
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
      margin: theme.spacing(1),
    },
    leftIcon: {
      marginRight: theme.spacing(1),
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
  searchInputValue: '',
  search: '',
  newNote: false,
  userMenuEl: null as HTMLElement,
};

type State = Readonly<typeof initialState>;

interface Props extends WithStyles<typeof styles>, RouteComponentProps {
  notes: Map<number, NoteData>;
  is_signed_in: boolean;
  updateNote: (note: NoteData) => void;
  deleteNote: (id: number) => void;
  logOut: () => void;
}

class App extends Component<Props, State> {
  searchInput: React.RefObject<HTMLInputElement>;

  firstNote: React.RefObject<InnerNote>;

  // eslint-disable-next-line react/destructuring-assignment
  debouncedSearch = debounce(async () => this.state.searchInputValue, 100);

  constructor(props: Props) {
    super(props);

    this.state = initialState;
    this.searchInput = React.createRef();
    this.firstNote = React.createRef();
  }

  componentDidMount() {
    document.title = `noted`;
  }

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

  doSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchInputValue: e.target.value });
    this.setState({ search: await this.debouncedSearch() });
  };

  updateNote = (note?: NoteData) => {
    if (note) {
      const { updateNote: doUpdateNote } = this.props;
      doUpdateNote(note);
    }
    this.setState({ newNote: false });
  };

  createNew = (e: React.SyntheticEvent) => {
    e.preventDefault();
    this.create();
  };

  cancelSearch = (e: Mousetrap.ExtendedKeyboardEvent, _combo?: string) => {
    e.preventDefault();
    this.setState({ searchInputValue: '', search: '' });
  };

  createNewShortcut = (
    e: Mousetrap.ExtendedKeyboardEvent | React.SyntheticEvent,
    _combo?: string,
  ) => {
    e.preventDefault();
    this.create();
  };

  closeUserMenu = () => {
    this.setState({ userMenuEl: null });
  };

  openUserMenu = (e: React.MouseEvent<HTMLElement>) => {
    this.setState({ userMenuEl: e.currentTarget });
  };

  signOut = async (_e: React.SyntheticEvent) => {
    const { logOut: doLogOut } = this.props;
    this.setState({ userMenuEl: null });
    await axios.post('/api/sign_out');
    doLogOut();
  };

  create() {
    this.setState({ newNote: true });
  }

  render() {
    const {
      classes,
      history,
      deleteNote: doDeleteNote,
      is_signed_in: isSignedIn,
      notes,
    } = this.props;
    const { userMenuEl, searchInputValue, newNote, search } = this.state;
    const isUserMenuOpen = Boolean(userMenuEl);

    return (
      <div className={classes.root}>
        <AppBar className={classes.noPrint}>
          <Toolbar>
            <Switch>
              <Route exact path='/'>
                <IconButton className={classes.menuButton} aria-label='Menu' color='inherit'>
                  <MenuIcon />
                </IconButton>
              </Route>
              <Route>
                <IconButton
                  className={classes.menuButton}
                  aria-label='Menu'
                  color='inherit'
                  onClick={() => {
                    history.push('/');
                  }}
                >
                  <HomeIcon />
                </IconButton>
              </Route>
            </Switch>
            <Typography className={classes.title} variant='h6' color='inherit' noWrap>
              Noted
            </Typography>
            <div className={classes.grow} />
            <BindKeyboard keys='esc' callback={this.cancelSearch}>
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
                      value={searchInputValue}
                      onChange={this.doSearch}
                    />
                  </form>
                </div>
              </BindKeyboard>
            </BindKeyboard>
            <IconButton aria-haspopup='true' onClick={this.openUserMenu} color='inherit'>
              <AccountCircle />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Grid container spacing={2} className={classes.contentRoot}>
          {newNote ? (
            <Grid item xs={12}>
              <Note
                new
                depth={1}
                search={search}
                note={{
                  id: -1,
                  title: search,
                  tags: [],
                  body: '',
                  created_at: '',
                  updated_at: '',
                  user_id: 0,
                }}
                updateNote={this.updateNote}
                deleteNote={deleteNote}
              />
            </Grid>
          ) : null}
          <Switch>
            <Route exact path='/'>
              <NoteList
                createFromSearch={this.createNewShortcut}
                parent_note_id={null}
                depth={1}
                notes={notes}
                search={search}
                updateNote={this.updateNote}
                deleteNote={doDeleteNote}
                firstNoteRef={this.firstNote}
              />
            </Route>
            <Route path={['/note/:ids', '/disambiguation/:ids']}>
              <FilteredNoteList
                depth={1}
                search={search}
                updateNote={this.updateNote}
                deleteNote={doDeleteNote}
                firstNoteRef={this.firstNote}
              />
            </Route>
          </Switch>
        </Grid>

        <BindKeyboard keys='/' callback={this.startSearch} />
        <LogIn open={!isSignedIn} />
        <Menu
          anchorEl={userMenuEl}
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
  notes: getTopLevelNotes(state),
  is_signed_in: state.user.is_signed_in,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateNote(data: NoteData) {
    dispatch(updateNote(data));
  },

  deleteNote(id: number) {
    dispatch(deleteNote(id));
  },

  logOut() {
    dispatch(logOut());
  },
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(withStyles(styles)(App)),
);
