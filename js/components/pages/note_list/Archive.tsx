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

import NoteList from 'components/pages/note_list/NoteList';
import { getHasArchivedChild } from 'data/notes/selectors';

type Props = {
  search: string;
  createFromSearch: (e: { preventDefault: () => void }) => void;
};

const Archive = ({ createFromSearch, search }: Props) => (
  <NoteList
    createFromSearch={createFromSearch}
    noteViewFilter={useSelector(getHasArchivedChild)}
    parent_note_id={null}
    depth={1}
    search={search}
  />
);

export default Archive;