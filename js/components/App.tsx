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
import { connect, useSelector } from 'react-redux';
import { useMatch } from 'react-router-dom';

import { styled } from '@mui/material';

import AppBody from 'components/AppBody';
import BindKeyboard from 'components/BindKeyboard';
import Header from 'components/Header';
import LogIn from 'components/LogIn';
import { updateNote as updateNoteAction, deleteNote } from 'data/actions';
import { AppState } from 'data/reducers';
import { getHasArchivedChild, getIsNotArchived, getTopLevelNotes } from 'data/selectors';
import { NoteWithTags } from 'data/types';

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
};

const App = ({ doDeleteNote, doUpdateNote, isSignedIn, notes }: Props) => {
  const searchInput = React.useRef<HTMLInputElement>();
  const [newNote, setNewNote] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const isViewingArchive = useMatch({ path: '/archive', end: true });
  const noteViewFilter = useSelector<AppState, Map<number, boolean>>(
    isViewingArchive ? getHasArchivedChild : getIsNotArchived,
  );
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

  return (
    <AppRoot>
      <Header createNewShortcut={createNewShortcut} setSearch={setSearch} onStartEdit={startEdit} />
      <AppBody
        notes={notes}
        createNewShortcut={createNewShortcut}
        newNote={newNote}
        noteViewFilter={noteViewFilter}
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
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
