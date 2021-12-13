// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import * as React from 'react';
import { useSearchParams } from 'react-router-dom';

import { Grid } from '@mui/material';

import Note from './note/Note';
import Pages from './pages/Pages';

type NewNoteProps = {
  newNote: boolean;
  onNewNoteCancel: () => void;
};

export const NewNote = ({ newNote, onNewNoteCancel }: NewNoteProps) => {
  const [searchParams, _] = useSearchParams();
  const search = searchParams.get('search') || '';

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

type Props = {} & NewNoteProps;

const AppBody = ({ newNote, onNewNoteCancel }: Props) => (
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
    <NewNote newNote={newNote} onNewNoteCancel={onNewNoteCancel} />
    <Pages />
  </Grid>
);

export default AppBody;
