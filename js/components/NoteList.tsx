// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import * as React from 'react';
import Fuse from 'fuse.js';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Note, { InnerNote } from 'components/Note';
import classNames from 'classnames';
import { NoteData, AppState } from 'data/types';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { withStyles, createStyles, WithStyles } from '@material-ui/core/styles';
import {
  LinkIdMap,
  getFilteredSearchIndex,
  getSortedNoteIds,
} from 'data/selectors';
import { connect } from 'react-redux';

const styles = (theme: Theme) =>
  createStyles({
    newButton: {
      margin: theme.spacing.unit,
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
      marginRight: theme.spacing.unit,
    },
    iconSmall: {
      fontSize: 20,
    },
  });

interface Props extends WithStyles<typeof styles>, RouteComponentProps {
  notes: Map<number, NoteData>;
  searchIndex: Map<number, NoteData>;
  sortedIds: number[];
  search: string;
  depth: number;
  updateNote: (note?: NoteData) => void;
  deleteNote: (id: number) => void;
  createFromSearch?: (e: React.SyntheticEvent) => void;
  firstNoteRef?: React.RefObject<InnerNote>;
  renderOnly?: Set<number>;
  width?:
    | false
    | 'auto'
    | true
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12;
}

class NoteList extends React.Component<Props> {
  static defaultProps = {
    width: 12 as 12,
  };

  render() {
    const { classes } = this.props;
    let { notes } = this.props;

    if (this.props.renderOnly) {
      notes = new Map(
        Array.from(notes.entries()).filter(([id, note]) =>
          this.props.renderOnly.has(id)
        )
      );
    }

    if (this.props.search != '') {
      let fuse = new Fuse(Array.from(this.props.searchIndex.values()), {
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
        id: 'id',
        location: 0,
        matchAllTokens: true,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        shouldSort: true,
        threshold: 0.4,
        tokenize: true,
      });

      let elements = [];
      let results = (fuse.search(this.props.search) as any) as string[];

      if (
        this.props.depth == 1 &&
        (results.length == 0 ||
          notes.get(parseInt(results[0], 10)).title != this.props.search)
      ) {
        elements.push(
          <Grid item key='new' className={classes.item} xs={this.props.width}>
            <Button
              variant='contained'
              color='primary'
              className={classes.newButton}
              onClick={this.props.createFromSearch}
            >
              <AddIcon
                className={classNames(classes.leftIcon, classes.iconSmall)}
              />
              Add {this.props.search}
            </Button>
          </Grid>
        );
      }

      let i = 0;
      for (let idStr of results) {
        let id = parseInt(idStr, 10);
        if (!notes.has(id)) {
          console.log('Note ', id, ' not found');
        } else {
          elements.push(
            <Grid item key={id} className={classes.item} xs={this.props.width}>
              <Note
                depth={this.props.depth + 1}
                note={notes.get(id)}
                search={this.props.search}
                updateNote={this.props.updateNote}
                deleteNote={this.props.deleteNote}
                innerRef={i == 0 ? this.props.firstNoteRef : null}
              />
            </Grid>
          );
          i++;
        }
      }
      return elements;
    } else {
      let result = [];
      for (let id of this.props.sortedIds) {
        if (notes.has(id)) {
          const n = notes.get(id);
          result.push(
            <Grid
              item
              key={n.id}
              className={classes.item}
              xs={this.props.width}
            >
              <Note
                depth={this.props.depth + 1}
                note={n}
                updateNote={this.props.updateNote}
                deleteNote={this.props.deleteNote}
                search={this.props.search}
              />
            </Grid>
          );
        }
      }
      return result;
    }
  }
}

const mapStateToProps = (
  state: AppState,
  props: { parent_note_id: number }
) => ({
  searchIndex: getFilteredSearchIndex(state, { note_id: props.parent_note_id }),
  sortedIds: getSortedNoteIds(state),
});

export default withRouter(
  connect(mapStateToProps)(withStyles(styles)(NoteList))
);
