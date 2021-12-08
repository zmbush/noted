// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import * as React from 'react';
import { Route, Routes } from 'react-router-dom';

import Archive from './note_list/Archive';
import Disambiguation from './note_list/Disambiguation';
import Index from './note_list/Index';
import SingleNote from './single_note/SingleNote';

type Props = {
  search: string;
  createFromSearch: (e: { preventDefault: () => void }) => void;
};

const Pages = ({ search, createFromSearch }: Props) => (
  <Routes>
    <Route path='/' element={<Index search={search} createFromSearch={createFromSearch} />} />
    <Route
      path='/archive'
      element={<Archive search={search} createFromSearch={createFromSearch} />}
    />
    <Route path='/note/:id' element={<SingleNote search={search} />} />
    <Route path='/disambiguation/:ids' element={<Disambiguation search={search} />} />
  </Routes>
);

export default Pages;
