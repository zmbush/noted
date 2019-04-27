// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import { combineReducers } from 'redux';

import notes from 'data/reducers/notes';
import user from 'data/reducers/user';
import ui from 'data/reducers/ui';

const rootReducer = combineReducers({ notes, user, ui });

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;
