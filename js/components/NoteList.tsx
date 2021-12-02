// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import Fuse from 'fuse.js';
import memoize from 'memoize-one';

import * as React from 'react';
import { useSelector } from 'react-redux';
import { useMatch } from 'react-router-dom';

import { Add as AddIcon } from '@mui/icons-material';
import { Button, Grid, styled } from '@mui/material';

import Note from 'components/Note';
import { AppState } from 'data/reducers';
import {
  getFilteredSearchIndex,
  getHasArchivedChild,
  getIsNotArchived,
  getSortedNoteIds,
} from 'data/selectors';
import { NoteWithTags } from 'data/types';

type Props = {
  notes: Map<number, NoteWithTags>;
  search: string;
  depth: number;
  onUpdateNote: (note?: NoteWithTags) => void;
  onDeleteNote: (id: number) => void;
  createFromSearch?: (e: React.SyntheticEvent) => void;
  renderOnly?: Set<number>;
  parent_note_id: number;
  width?: false | 'auto' | true | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
};

const GridItem = styled(Grid)({
  paddingTop: 0,
  '@media print': {
    padding: '0 !important',
  },
});

const getFuse = memoize(
  (index: Map<number, NoteWithTags>) =>
    new Fuse(Array.from(index.values()), {
      distance: 100,
      keys: [
        {
          name: 'title',
          weight: 1.0,
        },
        {
          name: 'tags',
          weight: 1.0,
        },
        {
          name: 'body',
          weight: 0.5,
        },
      ],
      location: 0,
      shouldSort: true,
      threshold: 0.4,
    }),
);

const NoteList = ({
  notes: notesIn,
  search,
  depth,
  onUpdateNote,
  onDeleteNote,
  createFromSearch,
  renderOnly,
  width = 12,
  parent_note_id: parentNoteId,
}: Props) => {
  const isViewingArchive = useMatch({ path: '/archive', end: true });
  const noteViewFilter = useSelector<AppState, Map<number, boolean>>(
    isViewingArchive ? getHasArchivedChild : getIsNotArchived,
  );
  const searchIndex = useSelector((state) =>
    getFilteredSearchIndex(state, { note_id: parentNoteId }),
  );
  const sortedIds = useSelector(getSortedNoteIds);

  let notes = notesIn;
  if (renderOnly) {
    notes = new Map(Array.from(notes.entries()).filter(([id, _note]) => renderOnly.has(id)));
  }

  if (search !== '') {
    const elements = [];
    const results = getFuse(searchIndex).search(search);

    if (depth === 1 && (results.length === 0 || notes.get(results[0].item.id).title !== search)) {
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

    results.forEach((result) => {
      const { id } = result.item;
      if (!notes.has(id)) {
        // eslint-disable-next-line no-console
        console.log('Note ', id, ' not found');
      } else {
        elements.push(
          <GridItem item key={id} xs={width}>
            <Note
              depth={depth + 1}
              note={notes.get(id)}
              search={search}
              onUpdateNote={onUpdateNote}
              onDeleteNote={onDeleteNote}
            />
          </GridItem>,
        );
      }
    });
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{elements}</>;
  }

  return (
    <>
      {sortedIds.map((id) => {
        if (notes.has(id)) {
          const n = notes.get(id);
          if (!noteViewFilter || noteViewFilter.get(id)) {
            return (
              <GridItem item key={n.id} xs={width}>
                <Note
                  depth={depth + 1}
                  note={n}
                  onUpdateNote={onUpdateNote}
                  onDeleteNote={onDeleteNote}
                  search={search}
                />
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
