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

import { Add as AddIcon } from '@mui/icons-material';
import { Button, Grid, styled } from '@mui/material';

import Note from 'components/note/Note';
import {
  getNoteEntities,
  getOrderedSearchIds,
  getSortedNoteIds,
  getSubNotes,
} from 'data/notes/selectors';
import { AppState } from 'data/store';
import { NoteWithTags } from 'data/types';
import { getFirstNoteId } from 'data/ui/selectors';
import { setFirstNote } from 'data/ui/slice';

type Props = {
  search: string;
  depth: number;
  createFromSearch?: (e: React.SyntheticEvent) => void;
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
  search,
  depth,
  createFromSearch,
  renderOnly,
  width = 12,
  noteViewFilter,
  parent_note_id: parentNoteId,
}: Props) => {
  const notesIn = useSelector<AppState, { [id: string]: NoteWithTags }>((state) =>
    renderOnly ? getNoteEntities(state) : getSubNotes(state, { noteId: parentNoteId }),
  );
  const sortedIds = useSelector(getSortedNoteIds);
  const firstNoteId = useSelector(getFirstNoteId);
  const searchResultIds = useSelector<AppState, number[]>((state) =>
    getOrderedSearchIds(state, { query: search }),
  );
  const dispatch = useDispatch();
  let firstNoteSet = false;

  const maybeSetFirstNote = (n: number | null) => {
    if (depth === 1 && !firstNoteSet) {
      firstNoteSet = true;
      if (firstNoteId !== n) {
        setTimeout(() => {
          dispatch(setFirstNote(n));
        });
      }
    }
  };

  let notes = notesIn;
  if (renderOnly) {
    notes = Object.fromEntries(
      Object.entries(notes).filter(([id, _note]) => renderOnly.has(parseInt(id, 10))),
    );
  }

  if (search !== '') {
    const elements = [];

    if (
      depth === 1 &&
      (searchResultIds.length === 0 ||
        !(searchResultIds[0] in notes) ||
        notes[searchResultIds[0]].title !== search)
    ) {
      elements.push(
        <GridItem item key='new' xs={width}>
          <Button
            variant='contained'
            color='primary'
            sx={{
              margin: 1,
              '@media print': {
                display: 'none',
              },
            }}
            onClick={createFromSearch}
          >
            <AddIcon
              sx={{
                marginRight: 1,
                fontSize: 20,
              }}
            />
            Add {search}
          </Button>
        </GridItem>,
      );
    }

    searchResultIds.forEach((id) => {
      if (!(id in notes)) {
        return;
      }
      if (!noteViewFilter || noteViewFilter[id]) {
        if (notes[id].title === search) {
          maybeSetFirstNote(id);
        }
        elements.push(
          <GridItem item key={id} xs={width}>
            <Note note={notes[id]}>
              <NoteList
                parent_note_id={id}
                noteViewFilter={noteViewFilter}
                depth={depth + 1}
                search={search}
              />
            </Note>
          </GridItem>,
        );
      }
    });
    // If a first note hasn't been set yet, it should be null.
    maybeSetFirstNote(null);
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{elements}</>;
  }

  return (
    <>
      {sortedIds.map((id) => {
        if (id in notes) {
          const n = notes[id];
          if (!noteViewFilter || noteViewFilter[id]) {
            maybeSetFirstNote(id);
            return (
              <GridItem item key={n.id} xs={width}>
                <Note note={n}>
                  <NoteList
                    parent_note_id={n.id}
                    noteViewFilter={noteViewFilter}
                    depth={depth + 1}
                    search={search}
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
