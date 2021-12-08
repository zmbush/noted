// Copyright 2021 Zachary Bush.
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
import { getNoteEntities } from 'data/notes/selectors';

type Props = {
  search: string;
};

const SingleNote = ({ search }: Props) => {
  const { id = '' } = useParams<'id'>();
  const parsedId = new Set([parseInt(id, 10)]);
  const notes = useSelector(getNoteEntities);
  const noteViewFilter = Object.fromEntries(Object.keys(notes).map((i) => [i, true]));

  return (
    <NoteList
      parent_note_id={null}
      noteViewFilter={noteViewFilter}
      renderOnly={parsedId}
      notes={notes}
      search={search}
      depth={1}
    />
  );
};

export default SingleNote;
