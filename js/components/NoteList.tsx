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

import { Add as AddIcon } from '@mui/icons-material';
import { Button, Grid, styled } from '@mui/material';

import Note from 'components/note/Note';
import { getFilteredSearchIndex, getSortedNoteIds } from 'data/notes/selectors';
import { NoteWithTags } from 'data/types';

type Props = {
  notes: { [id: number]: NoteWithTags };
  search: string;
  depth: number;
  createFromSearch?: (e: React.SyntheticEvent) => void;
  renderOnly?: Set<number>;
  noteViewFilter: { [id: number]: boolean } | null;
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
  (index: { [id: string]: NoteWithTags }) =>
    new Fuse(Object.values(index), {
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
  createFromSearch,
  renderOnly,
  width = 12,
  noteViewFilter,
  parent_note_id: parentNoteId,
}: Props) => {
  const searchIndex = useSelector((state) =>
    getFilteredSearchIndex(state, { note_id: parentNoteId }),
  );
  const sortedIds = useSelector(getSortedNoteIds);

  let notes = notesIn;
  if (renderOnly) {
    notes = Object.fromEntries(
      Object.entries(notes).filter(([id, _note]) => renderOnly.has(parseInt(id, 10))),
    );
  }

  if (search !== '') {
    const elements = [];
    const results = getFuse(searchIndex).search(search);

    if (depth === 1 && (results.length === 0 || notes[results[0].item.id].title !== search)) {
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
      if (!(id in notes)) {
        // eslint-disable-next-line no-console
        console.log('Note ', id, ' not found');
      } else {
        elements.push(
          <GridItem item key={id} xs={width}>
            <Note
              noteViewFilter={noteViewFilter}
              depth={depth + 1}
              note={notes[id]}
              search={search}
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
        if (id in notes) {
          const n = notes[id];
          if (!noteViewFilter || noteViewFilter[id]) {
            return (
              <GridItem item key={n.id} xs={width}>
                <Note noteViewFilter={noteViewFilter} depth={depth + 1} note={n} search={search} />
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
