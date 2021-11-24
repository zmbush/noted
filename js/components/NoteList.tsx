// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import classNames from 'classnames';
import Fuse from 'fuse.js';
import memoize from 'memoize-one';

import * as React from 'react';
import { connect } from 'react-redux';

import { Add as AddIcon } from '@mui/icons-material';
import { Button, Grid } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

import Note, { InnerNote } from 'components/Note';
import { getFilteredSearchIndex, getSortedNoteIds } from 'data/selectors';
import { NoteData, AppState } from 'data/types';

const styles = (theme: Theme) =>
  createStyles({
    newButton: {
      margin: theme.spacing(1),
      '@media print': {
        display: 'none',
      },
    },
    item: {
      '@media print': {
        padding: '0 !important',
      },
    },
    leftIcon: {
      marginRight: theme.spacing(1),
    },
    iconSmall: {
      fontSize: 20,
    },
  });

interface Props extends WithStyles<typeof styles> {
  notes: Map<number, NoteData>;
  searchIndex: Map<number, NoteData>;
  sortedIds: number[];
  search: string;
  depth: number;
  onUpdateNote: (note?: NoteData) => void;
  onDeleteNote: (id: number) => void;
  createFromSearch?: (e: React.SyntheticEvent) => void;
  firstNoteRef?: React.RefObject<InnerNote>;
  renderOnly?: Set<number>;
  width?: false | 'auto' | true | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}

class NoteList extends React.Component<Props> {
  static defaultProps = {
    width: 12 as 12,
  };

  constructor(props: Props) {
    super(props);
    this.getFuse(props.searchIndex);
  }

  getFuse = memoize(
    (index: Map<number, NoteData>) =>
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

  render() {
    const {
      classes,
      renderOnly,
      sortedIds,
      search,
      searchIndex,
      depth,
      width,
      createFromSearch,
      onUpdateNote,
      firstNoteRef,
      onDeleteNote,
    } = this.props;
    let { notes } = this.props;

    if (renderOnly) {
      notes = new Map(Array.from(notes.entries()).filter(([id, _note]) => renderOnly.has(id)));
    }

    if (search !== '') {
      const elements = [];
      const results = this.getFuse(searchIndex).search(search);

      if (depth === 1 && (results.length === 0 || notes.get(results[0].item.id).title !== search)) {
        elements.push(
          <Grid item key='new' className={classes.item} xs={width}>
            <Button
              variant='contained'
              color='primary'
              className={classes.newButton}
              onClick={createFromSearch}
            >
              <AddIcon className={classNames(classes.leftIcon, classes.iconSmall)} />
              Add {search}
            </Button>
          </Grid>,
        );
      }

      let i = 0;
      results.forEach((result) => {
        const { id } = result.item;
        if (!notes.has(id)) {
          // eslint-disable-next-line no-console
          console.log('Note ', id, ' not found');
        } else {
          elements.push(
            <Grid item key={id} className={classes.item} xs={width}>
              <Note
                depth={depth + 1}
                note={notes.get(id)}
                search={search}
                onUpdateNote={onUpdateNote}
                onDeleteNote={onDeleteNote}
                ref={i === 0 ? firstNoteRef : null}
              />
            </Grid>,
          );
          i += 1;
        }
      });
      return elements;
    }
    const result: any[] = [];
    sortedIds.forEach((id) => {
      if (notes.has(id)) {
        const n = notes.get(id);
        result.push(
          <Grid item key={n.id} className={classes.item} xs={width}>
            <Note
              depth={depth + 1}
              note={n}
              onUpdateNote={onUpdateNote}
              onDeleteNote={onDeleteNote}
              search={search}
            />
          </Grid>,
        );
      }
    });
    return result;
  }
}

const mapStateToProps = (state: AppState, props: { parent_note_id: number }) => ({
  searchIndex: getFilteredSearchIndex(state, { note_id: props.parent_note_id }),
  sortedIds: getSortedNoteIds(state),
});

export default connect(mapStateToProps)(withStyles(styles)(NoteList));
