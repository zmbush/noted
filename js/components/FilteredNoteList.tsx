// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import Note, { InnerNote } from 'components/Note';
import { NoteData } from 'data/types';
import { withRouter, Redirect, RouteComponentProps } from 'react-router-dom';
import NoteList from 'components/NoteList';
import { LinkIdMap } from 'data/selectors';
import { AppState } from 'data/types';
import { connect } from 'react-redux';

interface Props extends RouteComponentProps {
  notes: Map<number, NoteData>;
  search: string;
  depth: number;
  updateNote: (note: NoteData) => void;
  deleteNote: (id: number) => void;
  firstNoteRef: React.RefObject<InnerNote>;
}

class FilteredNoteList extends React.Component<Props> {
  render() {
    const params = this.props.match.params as { ids: string };
    const parsedIds = new Set(params.ids.split(',').map(i => parseInt(i, 10)));

    return (
      <NoteList parent_note_id={null} renderOnly={parsedIds} {...this.props} />
    );
  }
}

export const Inner = FilteredNoteList;

const mapStateToProps = (state: AppState) => ({
  notes: state.notes,
});

export default withRouter(connect(mapStateToProps)(FilteredNoteList));
