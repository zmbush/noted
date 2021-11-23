// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import * as React from 'react';
import { NoteData, AppState } from 'data/types';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import NoteList from 'components/NoteList';
import { connect } from 'react-redux';
import { InnerNote } from './Note';

interface Props extends RouteComponentProps {
  notes: Map<number, NoteData>;
  search: string;
  depth: number;
  updateNote: (note: NoteData) => void;
  deleteNote: (id: number) => void;
  firstNoteRef: React.RefObject<InnerNote>;
}

const FilteredNoteList = (props: Props) => {
  const { match } = props;
  const params = match.params as { ids: string };
  const parsedIds = new Set(params.ids.split(',').map((i) => parseInt(i, 10)));

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <NoteList parent_note_id={null} renderOnly={parsedIds} {...props} />;
};

export const Inner = FilteredNoteList;

const mapStateToProps = (state: AppState) => ({
  notes: state.notes,
});

export default withRouter(connect(mapStateToProps)(FilteredNoteList));
