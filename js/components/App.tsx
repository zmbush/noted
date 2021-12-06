// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
import Mousetrap from 'mousetrap';

import * as React from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@mui/material';

import AppBody from 'components/AppBody';
import Header from 'components/Header';
import Loading from 'components/Loading';
import LogIn from 'components/LogIn';
import { getTopLevelNotes } from 'data/notes/selectors';
import { AppState } from 'data/store';
import { getUserLoading } from 'data/ui/selectors';

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
  const notes = useSelector(getTopLevelNotes);
  const isSignedIn = useSelector<AppState>((state) => state.user.isSignedIn);
  const isLoading = useSelector(getUserLoading);
  React.useEffect(() => {
    document.title = `noted`;
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
    // TODO: Get firstNote feature working again
    // if (firstNote.current) {
    //   firstNote.current.startEdit();
    // } else {
    createNew(e);
    // }
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
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <AppBody
            notes={notes}
            createNewShortcut={createNewShortcut}
            newNote={newNote}
            search={search}
            onNewNoteCancel={() => setNewNote(false)}
          />
          <LogIn open={!isSignedIn} />
        </>
      )}
    </AppRoot>
  );
};

export default App;
