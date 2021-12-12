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

const Pages = () => (
  <Routes>
    <Route path='/' element={<Index />} />
    <Route path='/archive' element={<Archive />} />
    <Route path='/note/:id' element={<SingleNote />} />
    <Route path='/disambiguation/:ids' element={<Disambiguation />} />
  </Routes>
);

export default Pages;
