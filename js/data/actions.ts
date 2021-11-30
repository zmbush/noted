// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { Dispatch } from 'redux';

import api from 'api';
import { NoteWithTags, User } from 'data/types';
import { ErrorData } from 'data/types';

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
  return { type: NotedEvent.NotesFetchStart } as const;
}

export function notesFetched(notes: NoteWithTags[]) {
  return { type: NotedEvent.NotesFetched, notes } as const;
}

export function updateNote(note: NoteWithTags) {
  return { type: NotedEvent.NotesUpdateNote, note } as const;
}

export function deleteNote(id: number) {
  return { type: NotedEvent.NotesDeleteNote, id } as const;
}

export function apiError(error: ErrorData) {
  return { type: NotedEvent.ApiError, error } as const;
}

export function logIn(user: User) {
  return { type: NotedEvent.UserSignedIn, user } as const;
}

export function logOut() {
  return { type: NotedEvent.UserSignedOut } as const;
}

export async function fetchData(dispatch: Dispatch) {
  dispatch(notesFetchStart());
  try {
    dispatch(notesFetched(await api.note.list()));
  } catch (e) {
    if (e.response) {
      dispatch(apiError(e.response.data));
    }
  }
}
