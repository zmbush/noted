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
  NotesFetchStart = 'NOTES_FETCH_START',
  NotesFetched = 'NOTES_FETCHED',
  NotesUpdateNote = 'NOTES_UPDATE_NOTE',
  NotesDeleteNote = 'NOTES_DELETE_NOTE',

  ApiError = 'API_ERROR',

  UserSignedIn = 'USER_SIGNED_IN',
  UserSignedOut = 'USER_SIGNED_OUT',
}

export function notesFetchStart() {
  return { type: NotedEvent.NotesFetchStart };
}

export function notesFetched(notes: NoteData[]) {
  return { type: NotedEvent.NotesFetched, notes };
}

export function updateNote(note: NoteData) {
  return { type: NotedEvent.NotesUpdateNote, note };
}

export function deleteNote(id: number) {
  return { type: NotedEvent.NotesDeleteNote, id };
}

export function apiError(error: ErrorData) {
  return { type: NotedEvent.ApiError, error };
}

export function logIn(user: UserData) {
  return { type: NotedEvent.UserSignedIn, user };
}

export function logOut() {
  return { type: NotedEvent.UserSignedOut };
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
