// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import createCachedSelector from 're-reselect';

import * as React from 'react';
import { useSelector } from 'react-redux';

import { AppState } from 'features/redux/store';

import Loading from 'components/Loading';

import { prefix as noteLoadingPrefix, NoteLoadingState } from './slice';

export const getNoteLoading = (state: AppState): NoteLoadingState => state[noteLoadingPrefix];
const noteId = (_: AppState, { id }: { id: number }) => id;

export const getIsNoteChanging = createCachedSelector(
  getNoteLoading,
  noteId,
  (noteLoading, id) => !!noteLoading[id],
)((_, { id }) => id);

interface Props {
  id: number;
}

const NoteLoading = ({ id }: Props) => {
  const noteChanging = useSelector((state: AppState) => getIsNoteChanging(state, { id }));
  return (
    <Loading
      in={noteChanging}
      timeout={1000}
      sx={{
        position: 'absolute',
        margin: 'auto',
        width: 80,
        height: 80,
        left: 0,
        right: 0,
        top: 40,
      }}
    />
  );
};

export default NoteLoading;
