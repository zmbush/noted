// Copyright 2018 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import * as React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import NoteList from 'components/NoteList';
import { AppState } from 'data/reducers';
import { NoteWithTags } from 'data/types';

interface Props {
  search: string;
  depth: number;
}

const FilteredNoteList = ({ search, depth }: Props) => {
  const { ids = '' } = useParams<'ids'>();
  const parsedIds = new Set(ids.split(',').map((i) => parseInt(i, 10)));
  const notes = useSelector<AppState, Map<number, NoteWithTags>>((state) => state.notes);

  return (
    <NoteList
      parent_note_id={null}
      renderOnly={parsedIds}
      notes={notes}
      search={search}
      depth={depth}
    />
  );
};

export default FilteredNoteList;
