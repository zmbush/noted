// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@mui/material';

import { AppState } from 'data/store';
import { getFirstNoteId, getUserLoading } from 'data/ui/selectors';
import { setEditingNote } from 'data/ui/slice';

import AppBody from './AppBody';
import ErrorManager from './core/ErrorManager';
import Loading from './core/Loading';
import LogIn from './pages/login/LogIn';
import Header from './ui/header/Header';

const AppRoot = styled('div')({
  width: '100%',
  '@media print': {
    overflow: 'visible !important',
    columnCount: 2,
    columnWidth: '200px',
  },
});

const App = () => {
  const [newNote, setNewNote] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const isSignedIn = useSelector<AppState>((state) => state.user.isSignedIn);
  const isLoading = useSelector(getUserLoading);
  const firstNote = useSelector(getFirstNoteId);
  const dispatch = useDispatch();
  React.useEffect(() => {
    document.title = `Noted`;
  }, []);

  const create = () => {
    setNewNote(true);
  };

  const createNew = (e: React.SyntheticEvent) => {
    e.preventDefault();
    create();
  };

  const startEdit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (firstNote) {
      dispatch(setEditingNote(firstNote));
    } else {
      createNew(e);
    }
  };

  const createNewShortcut = (e: { preventDefault: () => void }, _combo?: string) => {
    e.preventDefault();
    create();
  };

  return (
    <AppRoot>
      <Header createNewShortcut={createNewShortcut} setSearch={setSearch} onStartEdit={startEdit} />
      {isLoading ? (
        <Loading />
      ) : (
        <AppBody
          createNewShortcut={createNewShortcut}
          newNote={newNote}
          search={search}
          onNewNoteCancel={() => setNewNote(false)}
        />
      )}
      <LogIn open={!isSignedIn && !isLoading} />
      <ErrorManager />
    </AppRoot>
  );
};

export default App;
