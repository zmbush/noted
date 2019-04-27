// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import { createSelector } from 'reselect';
import createCachedSelector from 're-reselect';
import { NoteData, AppState } from 'data/types';

const getNotes = (state: AppState) => state.notes;
const getNoteId = (_: any, props: { note_id: number }) => props.note_id;

const listNotes = createSelector(
  getNotes,
  (notes: Map<number, NoteData>) => Array.from(notes.values())
);

const listAllTitles = createSelector(
  listNotes,
  notes => notes.map(note => [note.id, note.title])
);

const listAllTitleParts = createSelector(
  listAllTitles,
  (titleList: [number, string][]) =>
    titleList.flatMap(([id, title]) => {
      let titles = [[title, id]];
      for (let titlePart of title.split(' ')) {
        if (titlePart.length > 3) {
          titles.push([titlePart, id]);
        }
      }
      return titles;
    })
);

export const getLinkIds = createSelector(
  listAllTitleParts,
  (titleParts: [string, number][]) =>
    titleParts.reduce((titles, [titlePart, id]) => {
      if (titles.has(titlePart)) {
        titles.get(titlePart).add(id);
      } else {
        titles.set(titlePart, new Set([id]));
      }
      return titles;
    }, new Map<string, Set<number>>())
);

export type LinkIdMap = ReturnType<typeof getLinkIds>;

export const getTopLevelNotes = createSelector(
  listNotes,
  notes => {
    const topLevel = new Map();
    for (let note of notes) {
      if (!note.parent_note_id) {
        topLevel.set(note.id, note);
      }
    }
    return topLevel;
  }
);

export const getSubnotes = createCachedSelector(
  listNotes,
  getNoteId,
  (notes, note_id) => {
    const subnotes = new Map();

    for (let note of notes.values()) {
      if (note.parent_note_id == note_id) {
        subnotes.set(note.id, note);
      }
    }

    return subnotes;
  }
)((state, props: { note_id: number }) => props.note_id);

export type SubnoteMap = ReturnType<typeof getSubnotes>;

const calculateMergedNote = (
  note: NoteData,
  notes: Map<number, NoteData>
): NoteData => {
  let newNote = Object.assign({}, note);
  let subnotes = getSubnotes({ notes }, { note_id: note.id });

  for (let subnote of subnotes.values()) {
    let mergedNote = calculateMergedNote(subnote, notes);
    newNote.title = `${newNote.title} ${mergedNote.title}`;
    newNote.tags = Array.from(new Set([...newNote.tags, ...mergedNote.tags]));
    newNote.body = `${newNote.body} ${mergedNote.body}`;
  }

  return newNote;
};

export const getSearchIndex = createSelector(
  getNotes,
  allNotes => {
    let result = new Map();
    for (let note of allNotes.values()) {
      result.set(note.id, calculateMergedNote(note, allNotes));
    }
    return result;
  }
);

export const getFilteredSearchIndex = createCachedSelector(
  getSearchIndex,
  getNoteId,
  (notes, note_id) => {
    const subnotes = new Map();

    for (let note of notes.values()) {
      if (note.parent_note_id == note_id) {
        subnotes.set(note.id, note);
      }
    }

    return subnotes;
  }
)((state, props: { note_id: number }) =>
  props.note_id == null ? -1 : props.note_id
);
