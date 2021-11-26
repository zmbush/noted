// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
import axios from 'axios';
import Mousetrap from 'mousetrap';
import { Dispatch } from 'redux';

import * as React from 'react';
import { connect } from 'react-redux';
import { Route, Routes } from 'react-router-dom';

import { Grid, styled } from '@mui/material';

import BindKeyboard from 'components/BindKeyboard';
import FilteredNoteList from 'components/FilteredNoteList';
import Header from 'components/Header';
import LogIn from 'components/LogIn';
import Note from 'components/Note';
import NoteList from 'components/NoteList';
import { updateNote as updateNoteAction, deleteNote, logOut } from 'data/actions';
import { getTopLevelNotes } from 'data/selectors';
import { NoteData, AppState } from 'data/types';

const AppRoot = styled('div')({
  width: '100%',
  '@media print': {
    overflow: 'visible !important',
    columnCount: 2,
    columnWidth: '200px',
  },
});

type Props = {
  notes: Map<number, NoteData>;
  isSignedIn: boolean;
  doUpdateNote: (note: NoteData) => void;
  doDeleteNote: (id: number) => void;
  doLogOut: () => void;
};

const App = ({ doDeleteNote, doUpdateNote, doLogOut, isSignedIn, notes }: Props) => {
  const searchInput = React.useRef<HTMLInputElement>();
  const [newNote, setNewNote] = React.useState(false);
  const [search, setSearch] = React.useState('');
  React.useEffect(() => {
    document.title = `noted`;
  }, []);

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
    // TODO: Get firstNote feature working again
    // if (firstNote.current) {
    //   firstNote.current.startEdit();
    // } else {
    createNew(e);
    // }
  };

  const updateNote = (note?: NoteData) => {
    if (note) {
      doUpdateNote(note);
    }
    setNewNote(false);
  };

  const createNewShortcut = (
    e: Mousetrap.ExtendedKeyboardEvent | React.SyntheticEvent,
    _combo?: string,
  ) => {
    e.preventDefault();
    create();
  };

  const signOut = async (_e: React.SyntheticEvent) => {
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
    <AppRoot>
      <Header
        createNewShortcut={createNewShortcut}
        setSearch={setSearch}
        onStartEdit={startEdit}
        onSignOut={signOut}
      />
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
    </AppRoot>
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
