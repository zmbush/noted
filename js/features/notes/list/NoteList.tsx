// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import * as React from 'react';
import { useSelector } from 'react-redux';

import { Grid, styled } from '@mui/material';

import { AppState } from 'features/redux/store';

import { NoteWithTags } from 'data/types';

import Note from '../view/Note';

import { getNoteEntities, getSortedNoteIds, getSubNotes } from './selectors';

type Props = {
  depth: number;
  renderOnly?: Set<number>;
  noteViewFilter: { [id: number]: boolean } | null;
  parent_note_id: number | null;
  width?: false | 'auto' | true | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
};

const GridItem = styled(Grid)({
  paddingTop: 0,
  '@media print': {
    padding: '0 !important',
  },
});

const NoteList = ({
  depth,
  renderOnly,
  width = 12,
  noteViewFilter,
  parent_note_id: parentNoteId,
}: Props) => {
  const notesIn = useSelector<AppState, { [id: string]: NoteWithTags }>((state) =>
    renderOnly ? getNoteEntities(state) : getSubNotes(state, { noteId: parentNoteId }),
  );
  const sortedIds = useSelector(getSortedNoteIds);

  let notes = notesIn;
  if (renderOnly) {
    notes = Object.fromEntries(
      Object.entries(notes).filter(([id, _note]) => renderOnly.has(parseInt(id, 10))),
    );
  }

  return (
    <>
      {sortedIds.map((id) => {
        if (id in notes) {
          const n = notes[id];
          if (!noteViewFilter || noteViewFilter[id]) {
            return (
              <GridItem item key={n.id} xs={width}>
                <Note note={n}>
                  <NoteList
                    parent_note_id={n.id}
                    noteViewFilter={noteViewFilter}
                    depth={depth + 1}
                  />
                </Note>
              </GridItem>
            );
          }
        }
        return null;
      })}
    </>
  );
};

export default NoteList;
