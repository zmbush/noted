// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

export type { AppState } from 'data/reducers';
export type { NoteWithTags, User as UserData } from 'data/api_types';

export type ErrorData = {
  code: number;
  error: string;
};
