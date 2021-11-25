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

import {
  AccountCircle,
  Home as HomeIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  AppBar,
  Grid,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  styled,
  Toolbar,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import * as styles from 'components/App.tsx.scss';
import BindKeyboard from 'components/BindKeyboard';
import FilteredNoteList from 'components/FilteredNoteList';
import LogIn from 'components/LogIn';
import Note from 'components/Note';
import NoteList from 'components/NoteList';
import { updateNote as updateNoteAction, deleteNote, logOut } from 'data/actions';
import { getTopLevelNotes } from 'data/selectors';
import { NoteData, AppState } from 'data/types';

const SearchDiv = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  marginRight: theme.spacing(1),
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconDiv = styled('div')(({ theme }) => ({
  width: theme.spacing(9),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

type Props = {
  notes: Map<number, NoteData>;
  isSignedIn: boolean;
  doUpdateNote: (note: NoteData) => void;
  doDeleteNote: (id: number) => void;
  doLogOut: () => void;
};

const App = ({ doDeleteNote, doUpdateNote, doLogOut, isSignedIn, notes }: Props) => {
  const searchInput = React.useRef<HTMLInputElement>();
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
    // TODO: Get firstnote feature working again
    // if (firstNote.current) {
    //   firstNote.current.startEdit();
    // } else {
    createNew(e);
    // }
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
      onUpdateNote={updateNote}
      onDeleteNote={doDeleteNote}
    />
  );

  return (
    <div className={styles.root}>
      <AppBar sx={{ displayPrint: 'none' }}>
        <Toolbar>
          <Routes>
            <Route
              path='/'
              element={
                <IconButton
                  aria-label='Menu'
                  color='inherit'
                  size='large'
                  sx={{
                    marginLeft: '-12px',
                    marginRight: '20px',
                  }}
                >
                  <MenuIcon />
                </IconButton>
              }
            />
            <Route
              path='/*'
              element={
                <IconButton
                  aria-label='Menu'
                  color='inherit'
                  onClick={() => {
                    navigate('/');
                  }}
                  size='large'
                  sx={{
                    marginLeft: '-12px',
                    marginRight: '20px',
                  }}
                >
                  <HomeIcon />
                </IconButton>
              }
            />
          </Routes>
          <Typography
            variant='h6'
            color='inherit'
            noWrap
            sx={(theme) => ({
              display: 'none',
              [theme.breakpoints.up('sm')]: {
                display: 'block',
              },
            })}
          >
            Noted
          </Typography>
          <div className={styles.grow} />
          <BindKeyboard keys='esc' callback={cancelSearch}>
            <BindKeyboard keys='ctrl+o' callback={createNewShortcut}>
              <SearchDiv>
                <SearchIconDiv>
                  <SearchIcon />
                </SearchIconDiv>
                <form onSubmit={startEdit}>
                  <InputBase
                    inputProps={{
                      ref: searchInput,
                    }}
                    placeholder='Search...'
                    value={searchInputValue}
                    onChange={doSearch}
                    sx={(theme) => ({
                      color: 'inherit',
                      width: '100%',
                      '& .MuiInputBase-input': {
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
                    })}
                  />
                </form>
              </SearchDiv>
            </BindKeyboard>
          </BindKeyboard>
          <IconButton aria-haspopup='true' onClick={openUserMenu} color='inherit' size='large'>
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Grid
        container
        spacing={2}
        sx={{
          '@media print': {
            marginTop: 0,
            display: 'block',
          },
          marginTop: '75px',
        }}
      >
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
              onUpdateNote={updateNote}
              onDeleteNote={deleteNote}
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
                onUpdateNote={updateNote}
                onDeleteNote={doDeleteNote}
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
  isSignedIn: state.user.is_signed_in,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  doUpdateNote(data: NoteData) {
    dispatch(updateNoteAction(data));
  },

  doDeleteNote(id: number) {
    dispatch(deleteNote(id));
  },

  doLogOut() {
    dispatch(logOut());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
