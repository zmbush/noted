// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import { AppState } from 'data/reducers';

export type NoteData = {
  id: number;
  title: string;
  body: string;
  tags: string[];
};

export type AppState = AppState;
