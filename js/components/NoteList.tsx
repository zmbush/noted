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
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { withStyles, createStyles, WithStyles } from '@material-ui/core/styles';

const styles = (theme: Theme) =>
  createStyles({
    newButton: {
      margin: theme.spacing.unit,
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

    let titles = Array.from(this.props.notes.values()).reduce(
      (titles, note: { title: string; id: number }) => {
        titles.set(note.title, new Set([note.id]));
        for (let titlePart of note.title.split(' ')) {
          if (titlePart.length > 3) {
            if (titles.has(titlePart)) {
              titles.get(titlePart).add(note.id);
            } else {
              titles.set(titlePart, new Set([note.id]));
            }
          }
        }
        return titles;
      },
      new Map<string, Set<number>>()
    );

    if (this.props.search != '') {
      let fuse = new Fuse(Array.from(this.props.notes.values()), {
        distance: 100,
        includeMatches: true,
        keys: [
          {
            name: 'title',
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
          <Grid item key='new' xs={12}>
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
          <Grid item key={n.item.id} xs={12}>
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
      let notes = Array.from(this.props.notes.values()).sort((a, b) => {
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
      return notes.map(n => (
        <Grid item key={n.id} xs={12}>
          <Note note={n} updateNote={this.props.updateNote} titles={titles} />
        </Grid>
      ));
    }
  }
}

export default withRouter(withStyles(styles)(NoteList));
