// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import Note from 'components/Note';
import { NoteData } from 'data/types';
import { withRouter, Redirect, RouteComponentProps } from 'react-router-dom';

interface Props extends RouteComponentProps {
  notes: Map<number, NoteData>;
  updateNote: (note: NoteData) => void;
}

class SingleNote extends React.Component<Props> {
  getNote() {
    const params = this.props.match.params as { id: string };
    const parsedId = parseInt(params.id, 10);
    if (parsedId == NaN) {
      return null;
    }
    if (!this.props.notes.has(parsedId)) {
      return null;
    }
    return this.props.notes.get(parsedId);
  }

  render() {
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
    const note = this.getNote();
    if (note) {
      return (
        <Grid item xs={12}>
          <Note
            note={note}
            updateNote={this.props.updateNote}
            titles={titles}
          />
        </Grid>
      );
    } else if (this.props.notes.size > 0) {
      return <Redirect to='/' />;
    } else {
      return null;
    }
  }
}

export default withRouter(SingleNote);
