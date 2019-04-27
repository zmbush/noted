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
import { NoteData } from 'data/types';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { withStyles, createStyles, WithStyles } from '@material-ui/core/styles';
import { LinkIdMap } from 'data/selectors';

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
  search: string;
  updateNote: (note?: NoteData) => void;
  deleteNote: (id: number) => void;
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
      let fuse = new Fuse(Array.from(notes.values()), {
        distance: 100,
        includeMatches: true,
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
        matchAllTokens: true,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        shouldSort: true,
        threshold: 0.4,
        tokenize: true,
      });

      let elements = [];
      let results = fuse.search(this.props.search);
      if (results.length == 0 || results[0].item.title != this.props.search) {
        elements.push(
          <Grid item key='new' className={classes.item} xs={this.props.width}>
            <Button
              variant='contained'
              color='primary'
              className={classes.newButton}
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
      for (let n of results) {
        elements.push(
          <Grid
            item
            key={n.item.id}
            className={classes.item}
            xs={this.props.width}
          >
            <Note
              note={n.item}
              search={this.props.search}
              matches={n.matches}
              updateNote={this.props.updateNote}
              deleteNote={this.props.deleteNote}
              innerRef={i == 0 ? this.props.firstNoteRef : null}
            />
          </Grid>
        );
        i++;
      }
      return elements;
    } else {
      let sorted_notes = Array.from(notes.values()).sort((a, b) => {
        var x = a.title;
        var y = b.title;
        if (x < y) {
          return -1;
        }
        if (x > y) {
          return 1;
        }
        return 0;
      });
      return sorted_notes.map(n => (
        <Grid item key={n.id} className={classes.item} xs={this.props.width}>
          <Note
            note={n}
            updateNote={this.props.updateNote}
            deleteNote={this.props.deleteNote}
            search={this.props.search}
          />
        </Grid>
      ));
    }
  }
}

export default withRouter(withStyles(styles)(NoteList));
