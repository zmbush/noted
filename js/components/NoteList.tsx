// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import * as Fuse from 'fuse.js';
import * as React from 'react';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Note, { InnerNote } from 'components/Note';
import classNames from 'classnames';
import { NoteData } from 'data/types';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import { parseTitles } from 'components/AutoLink';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { withStyles, createStyles, WithStyles } from '@material-ui/core/styles';

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
  updateNote: (note: NoteData) => void;
  firstNoteRef: React.RefObject<InnerNote>;
  renderOnly?: Set<number>;
}

class NoteList extends React.Component<Props> {
  render() {
    const { classes } = this.props;
    let { notes } = this.props;

    const titles = parseTitles(notes);

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
          <Grid item key='new' xs={12} className={classes.item}>
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
          <Grid item key={n.item.id} xs={12} className={classes.item}>
            <Note
              note={n.item}
              matches={n.matches}
              updateNote={this.props.updateNote}
              innerRef={i == 0 ? this.props.firstNoteRef : null}
              titles={titles}
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
        <Grid item key={n.id} xs={12} className={classes.item}>
          <Note note={n} updateNote={this.props.updateNote} titles={titles} />
        </Grid>
      ));
    }
  }
}

export default withRouter(withStyles(styles)(NoteList));
