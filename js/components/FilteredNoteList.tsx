// Copyright 2018 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import * as React from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import NoteList from 'components/NoteList';
import { AppState } from 'data/reducers';
import { NoteWithTags } from 'data/types';

interface Props {
  notes: Map<number, NoteWithTags>;
  search: string;
  depth: number;
}

const FilteredNoteList = (props: Props) => {
  const { ids = '' } = useParams<'ids'>();
  const parsedIds = new Set(ids.split(',').map((i) => parseInt(i, 10)));

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <NoteList parent_note_id={null} renderOnly={parsedIds} {...props} />;
};

export const Inner = FilteredNoteList;

const mapStateToProps = (state: AppState) => ({
  notes: state.notes,
});

export default connect(mapStateToProps)(FilteredNoteList);
