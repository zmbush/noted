// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
import Mousetrap from 'mousetrap';
import { Dispatch } from 'redux';

import * as React from 'react';
import { connect } from 'react-redux';

import { styled } from '@mui/material';

import api from 'api';
import AppBody from 'components/AppBody';
import BindKeyboard from 'components/BindKeyboard';
import Header from 'components/Header';
import LogIn from 'components/LogIn';
import { updateNote as updateNoteAction, deleteNote, logOut } from 'data/actions';
import { NoteWithTags } from 'data/api_types';
import { AppState } from 'data/reducers';
import { getTopLevelNotes } from 'data/selectors';

const AppRoot = styled('div')({
  width: '100%',
  '@media print': {
    overflow: 'visible !important',
    columnCount: 2,
    columnWidth: '200px',
  },
});

type Props = {
  notes: Map<number, NoteWithTags>;
  isSignedIn: boolean;
  doUpdateNote: (note: NoteWithTags) => void;
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

  const updateNote = (note?: NoteWithTags) => {
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
    await api.user.signOut();
    doLogOut();
  };

  return (
    <AppRoot>
      <Header
        createNewShortcut={createNewShortcut}
        setSearch={setSearch}
        onStartEdit={startEdit}
        onSignOut={signOut}
      />
      <AppBody
        notes={notes}
        createNewShortcut={createNewShortcut}
        newNote={newNote}
        search={search}
        onDeleteNote={doDeleteNote}
        onUpdateNote={updateNote}
      />
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
  doUpdateNote(data: NoteWithTags) {
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
