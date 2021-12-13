// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import * as React from 'react';
import { useParams } from 'react-router-dom';

import NoteList from 'components/pages/note_list/NoteList';

const SingleNote = () => {
  const { id = '' } = useParams<'id'>();
  const parsedId = new Set([parseInt(id, 10)]);

  return <NoteList parent_note_id={null} noteViewFilter={null} renderOnly={parsedId} depth={1} />;
};

export default SingleNote;
