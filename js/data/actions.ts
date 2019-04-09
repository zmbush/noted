// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import { NoteData, ErrorData, UserData } from 'data/types';
import axios from 'axios';
import { Dispatch } from 'redux';

export enum NotedEvent {
  NOTES_FETCH_START,
  NOTES_FETCHED,
  NOTES_UPDATE_NOTE,

  API_ERROR,

  USER_SIGNED_IN,
  USER_SIGNED_OUT,
}

export function notesFetchStart() {
  return { type: NotedEvent.NOTES_FETCH_START };
}

export function notesFetched(notes: NoteData[]) {
  return { type: NotedEvent.NOTES_FETCHED, notes };
}

export function updateNote(note: NoteData) {
  return { type: NotedEvent.NOTES_UPDATE_NOTE, note };
}

export function apiError(error: ErrorData) {
  return { type: NotedEvent.API_ERROR, error };
}

export function logIn(user: UserData) {
  return { type: NotedEvent.USER_SIGNED_IN, user };
}

export function logOut() {
  return { type: NotedEvent.USER_SIGNED_OUT };
}

export async function fetchData(dispatch: Dispatch) {
  dispatch(notesFetchStart());
  try {
    dispatch(notesFetched((await axios.get('/api/secure/notes')).data));
  } catch (e) {
    if (e.response) {
      dispatch(apiError(e.response.data));
    }
  }
}
