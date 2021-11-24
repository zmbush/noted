// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
import axios from 'axios';
import debounce from 'debounce-promise';
import Mousetrap from 'mousetrap';
import { Dispatch } from 'redux';

import * as React from 'react';
import { connect } from 'react-redux';
import { Route, Routes, useNavigate } from 'react-router-dom';

import AccountCircle from '@mui/icons-material/AccountCircle';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import AppBar from '@mui/material/AppBar';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Theme, alpha } from '@mui/material/styles';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

import BindKeyboard from 'components/BindKeyboard';
import FilteredNoteList from 'components/FilteredNoteList';
import LogIn from 'components/LogIn';
import Note, { InnerNote } from 'components/Note';
import NoteList from 'components/NoteList';
import { updateNote as updateNoteAction, deleteNote, logOut } from 'data/actions';
import { getTopLevelNotes } from 'data/selectors';
import { NoteData, AppState } from 'data/types';

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
      // [theme.breakpoints.up('sm')]: {
      //   display: 'block',
      // },
    },
    search: {
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: alpha(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
      },
      marginLeft: 0,
      marginRight: theme.spacing(1),
      width: '100%',
      // [theme.breakpoints.up('sm')]: {
      //   marginLeft: theme.spacing(1),
      //   width: 'auto',
      // },
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
      // [theme.breakpoints.up('sm')]: {
      //   width: 120,
      //   '&:focus': {
      //     width: 200,
      //   },
      // },
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

interface Props extends WithStyles<typeof styles> {
  notes: Map<number, NoteData>;
  is_signed_in: boolean;
  updateNote: (note: NoteData) => void;
  deleteNote: (id: number) => void;
  logOut: () => void;
}

const App = ({
  classes,
  deleteNote: doDeleteNote,
  updateNote: doUpdateNote,
  logOut: doLogOut,
  is_signed_in: isSignedIn,
  notes,
}: Props) => {
  const searchInput = React.useRef<HTMLInputElement>();
  const firstNote = React.useRef<InnerNote>();
  const [userMenuEl, setUserMenuEl] = React.useState<HTMLElement>(null);
  const [searchInputValue, setSearchInputValue] = React.useState('');
  const [newNote, setNewNote] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, _] = React.useState<(v: string) => Promise<string>>(() =>
    debounce(async (v) => v, 100),
  );
  const navigate = useNavigate();
  React.useEffect(() => {
    document.title = `noted`;
  }, []);

  const isUserMenuOpen = Boolean(userMenuEl);

  const startSearch = (e: Event) => {
    e.preventDefault();
    searchInput.current.focus();
  };

  const create = () => {
    setNewNote(true);
  };

  const createNew = (e: React.SyntheticEvent) => {
    e.preventDefault();
    create();
  };

  const startEdit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (firstNote.current) {
      // TODO: Fix this.
      // firstNote.current.startEdit();
      createNew(e);
    } else {
      createNew(e);
    }
  };

  const doSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInputValue(e.target.value);
    setSearch(await debouncedSearch(e.target.value));
  };

  const updateNote = (note?: NoteData) => {
    if (note) {
      doUpdateNote(note);
    }
    setNewNote(false);
  };

  const cancelSearch = (e: Mousetrap.ExtendedKeyboardEvent, _combo?: string) => {
    e.preventDefault();
    setSearchInputValue('');
    setSearch('');
  };

  const createNewShortcut = (
    e: Mousetrap.ExtendedKeyboardEvent | React.SyntheticEvent,
    _combo?: string,
  ) => {
    e.preventDefault();
    create();
  };

  const closeUserMenu = () => {
    setUserMenuEl(null);
  };

  const openUserMenu = (e: React.MouseEvent<HTMLElement>) => {
    setUserMenuEl(e.currentTarget);
  };

  const signOut = async (_e: React.SyntheticEvent) => {
    setUserMenuEl(null);
    await axios.post('/api/sign_out');
    doLogOut();
  };

  const filteredNoteList = (
    <FilteredNoteList
      depth={1}
      search={search}
      updateNote={updateNote}
      deleteNote={doDeleteNote}
      firstNoteRef={firstNote}
    />
  );

  return (
    <div className={classes.root}>
      <AppBar className={classes.noPrint}>
        <Toolbar>
          <Routes>
            <Route
              path='/'
              element={
                <IconButton
                  className={classes.menuButton}
                  aria-label='Menu'
                  color='inherit'
                  size='large'
                >
                  <MenuIcon />
                </IconButton>
              }
            />
            <Route
              path='/*'
              element={
                <IconButton
                  className={classes.menuButton}
                  aria-label='Menu'
                  color='inherit'
                  onClick={() => {
                    navigate('/');
                  }}
                  size='large'
                >
                  <HomeIcon />
                </IconButton>
              }
            />
          </Routes>
          <Typography className={classes.title} variant='h6' color='inherit' noWrap>
            Noted
          </Typography>
          <div className={classes.grow} />
          <BindKeyboard keys='esc' callback={cancelSearch}>
            <BindKeyboard keys='ctrl+o' callback={createNewShortcut}>
              <div className={classes.search}>
                <div className={classes.searchIcon}>
                  <SearchIcon />
                </div>
                <form onSubmit={startEdit}>
                  <InputBase
                    inputProps={{
                      ref: searchInput,
                    }}
                    placeholder='Search...'
                    classes={{
                      root: classes.inputRoot,
                      input: classes.inputInput,
                    }}
                    value={searchInputValue}
                    onChange={doSearch}
                  />
                </form>
              </div>
            </BindKeyboard>
          </BindKeyboard>
          <IconButton aria-haspopup='true' onClick={openUserMenu} color='inherit' size='large'>
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
              updateNote={updateNote}
              deleteNote={deleteNote}
            />
          </Grid>
        ) : null}
        <Routes>
          <Route
            path='/'
            element={
              <NoteList
                createFromSearch={createNewShortcut}
                parent_note_id={null}
                depth={1}
                notes={notes}
                search={search}
                updateNote={updateNote}
                deleteNote={doDeleteNote}
                firstNoteRef={firstNote}
              />
            }
          />
          <Route path='/note/:ids' element={filteredNoteList} />
          <Route path='/disambiguation/:ids' element={filteredNoteList} />
        </Routes>
      </Grid>

      <BindKeyboard keys='/' callback={startSearch} />
      <LogIn open={!isSignedIn} />
      <Menu
        anchorEl={userMenuEl}
        open={isUserMenuOpen}
        onClose={closeUserMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MenuItem onClick={signOut}>
          <p>Sign Out</p>
        </MenuItem>
      </Menu>
    </div>
  );
};

const mapStateToProps = (state: AppState) => ({
  notes: getTopLevelNotes(state),
  is_signed_in: state.user.is_signed_in,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateNote(data: NoteData) {
    dispatch(updateNoteAction(data));
  },

  deleteNote(id: number) {
    dispatch(deleteNote(id));
  },

  logOut() {
    dispatch(logOut());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(App));
