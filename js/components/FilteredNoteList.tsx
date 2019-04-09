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
import { parseTitles } from 'components/AutoLink';
import { withRouter, Redirect, RouteComponentProps } from 'react-router-dom';
import NoteList from 'components/NoteList';

interface Props extends RouteComponentProps {
  notes: Map<number, NoteData>;
  search: string;
  updateNote: (note: NoteData) => void;
  firstNoteRef: React.RefObject<InnerNote>;
}

class FilteredNoteList extends React.Component<Props> {
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
    const params = this.props.match.params as { ids: string };
    const parsedIds = new Set(params.ids.split(',').map(i => parseInt(i, 10)));

    return <NoteList renderOnly={parsedIds} {...this.props} />;
  }
}

export default withRouter(FilteredNoteList);
