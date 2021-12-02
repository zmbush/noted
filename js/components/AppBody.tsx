// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import Mousetrap from 'mousetrap';

import * as React from 'react';
import { Route, Routes } from 'react-router-dom';

import { Grid } from '@mui/material';

import FilteredNoteList from 'components/FilteredNoteList';
import Note from 'components/Note';
import NoteList from 'components/NoteList';
import { NoteWithTags } from 'data/types';

type NewNoteProps = {
  newNote: boolean;
  search: string;
  onUpdateNote: (note?: NoteWithTags) => void;
  onDeleteNote: (id: number) => void;
};

export const NewNote = ({ newNote, search, onUpdateNote, onDeleteNote }: NewNoteProps) => {
  if (!newNote) {
    return null;
  }
  return (
    <Grid item xs={12}>
      <Note
        depth={1}
        search={search}
        note={{
          title: search,
          body: '',
        }}
        onUpdateNote={onUpdateNote}
        onDeleteNote={onDeleteNote}
        noteViewFilter={null}
      />
    </Grid>
  );
};

type Props = {
  notes: Map<number, NoteWithTags>;
  noteViewFilter: Map<number, boolean> | null;
  createNewShortcut: (
    e: Mousetrap.ExtendedKeyboardEvent | React.SyntheticEvent,
    combo?: string,
  ) => void;
} & NewNoteProps;

const AppBody = ({
  notes,
  noteViewFilter,
  createNewShortcut,
  newNote,
  search,
  onDeleteNote,
  onUpdateNote,
}: Props) => {
  const filteredNoteList = (
    <FilteredNoteList
      depth={1}
      search={search}
      onUpdateNote={onUpdateNote}
      onDeleteNote={onDeleteNote}
    />
  );

  const mainNoteList = (
    <NoteList
      createFromSearch={createNewShortcut}
      noteViewFilter={noteViewFilter}
      parent_note_id={null}
      depth={1}
      notes={notes}
      search={search}
      onUpdateNote={onUpdateNote}
      onDeleteNote={onDeleteNote}
    />
  );

  return (
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
      <NewNote
        newNote={newNote}
        search={search}
        onUpdateNote={onUpdateNote}
        onDeleteNote={onDeleteNote}
      />
      <Routes>
        <Route path='/' element={mainNoteList} />
        <Route path='/archive' element={mainNoteList} />
        <Route path='/note/:ids' element={filteredNoteList} />
        <Route path='/disambiguation/:ids' element={filteredNoteList} />
      </Routes>
    </Grid>
  );
};

export default AppBody;
