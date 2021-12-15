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

import NoteList from './NoteList';
import { getIsNotArchived } from './selectors';

const Index = () => {
  const noteViewFilter = useSelector(getIsNotArchived);
  return <NoteList noteViewFilter={noteViewFilter} parent_note_id={null} depth={1} />;
};

export default Index;
