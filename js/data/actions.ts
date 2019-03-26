// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

export enum NotedEvent {
  NOTES_FETCH_START,
  NOTES_FETCHED,
  NOTES_UPDATE_NOTE,
}

export function notesFetchStart() {
  return { type: NotedEvent.NOTES_FETCH_START };
}

export function notesFetched(notes: any[]) {
  return { type: NotedEvent.NOTES_FETCHED, notes };
}

export function updateNote(note: any) {
  return { type: NotedEvent.NOTES_UPDATE_NOTE, note };
}
