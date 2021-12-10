// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import * as React from 'react';

import { Grid } from '@mui/material';

import Note from './note/Note';
import Pages from './pages/Pages';

type NewNoteProps = {
  newNote: boolean;
  search: string;
  onNewNoteCancel: () => void;
};

export const NewNote = ({ newNote, search, onNewNoteCancel }: NewNoteProps) => {
  if (!newNote) {
    return null;
  }
  return (
    <Grid item xs={12}>
      <Note
        note={{
          title: search,
          body: '',
        }}
        onNewNoteCancel={onNewNoteCancel}
      />
    </Grid>
  );
};

type Props = {
  createNewShortcut: (e: { preventDefault: () => void }, combo?: string) => void;
} & NewNoteProps;

const AppBody = ({ createNewShortcut, newNote, search, onNewNoteCancel }: Props) => (
  <Grid
    container
    component='article'
    spacing={1}
    sx={{
      '@media print': {
        marginTop: 0,
        display: 'block',
      },
      marginTop: '75px',
    }}
  >
    <NewNote newNote={newNote} search={search} onNewNoteCancel={onNewNoteCancel} />
    <Pages search={search} createFromSearch={createNewShortcut} />
  </Grid>
);

export default AppBody;
