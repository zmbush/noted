// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import Fuse from 'fuse.js';
import createCachedSelector from 're-reselect';
import { createSelector } from 'reselect';

import { AppState } from 'data/store';
import { NoteWithTags } from 'data/types';

import { prefix } from './api';
import { notesAdapter } from './slice';

export const getNotes = (state: AppState) => state[prefix];
const noteSelectors = notesAdapter.getSelectors(getNotes);
export const getNoteEntities = createSelector(noteSelectors.selectEntities, (notesDict) =>
  Object.fromEntries(Object.entries(notesDict).map(([key, note]) => [key, note!])),
);
const maybeGetNoteId = (_: any, props: { noteId: number | null }) => props.noteId;
const maybeNoteIdIndex = (_: any, props: { noteId: number | null }) =>
  props.noteId === null ? -1 : props.noteId;
export const listNotes = noteSelectors.selectAll;
const validParent = (note: NoteWithTags) => !!note.parent_note_id;

const listAllTitles = createSelector(listNotes, (notes) =>
  notes.map((note) => [note.id, note.title]),
);

const listAllTitleParts = createSelector(listAllTitles, (titleList: [number, string][]) =>
  titleList.flatMap(([id, title]) => {
    const titles = [[title, id]];
    title.split(' ').forEach((titlePart) => {
      if (titlePart.length > 3) {
        titles.push([titlePart, id]);
      }
    });
    return titles;
  }),
);

export const getLinkIds = createSelector(listAllTitleParts, (titleParts: [string, number][]) =>
  titleParts.reduce((titles, [titlePart, id]) => {
    if (titlePart in titles) {
      titles[titlePart].add(id);
    } else {
      // eslint-disable-next-line no-param-reassign
      titles[titlePart] = new Set([id]);
    }
    return titles;
  }, {} as { [id: string]: Set<number> }),
);

export type LinkIdMap = ReturnType<typeof getLinkIds>;

export const getSubNotes = createCachedSelector(listNotes, maybeGetNoteId, (notes, noteId) => {
  const subNotes: { [id: number]: NoteWithTags } = {};

  if (!noteId) {
    notes.forEach((note) => {
      if (!validParent(note)) {
        subNotes[note.id] = note;
      }
    });
  } else {
    notes.forEach((note) => {
      if (note.parent_note_id === noteId && note.id !== noteId) {
        subNotes[note.id] = note;
      }
    });
  }

  return subNotes;
})(maybeNoteIdIndex);

export type SubNoteMap = ReturnType<typeof getSubNotes>;

export const getIsNotArchived = createSelector(getNoteEntities, (notes) => {
  const isNotArchived: { [id: number]: boolean } = {};
  Object.values(notes).forEach((note: NoteWithTags) => {
    isNotArchived[note.id] = !note.archived;
  });
  return isNotArchived;
});

export const getHasArchivedChild = createSelector(getNoteEntities, (notes) => {
  const hasArchivedChild: { [id: number]: boolean } = {};
  Object.values(notes).forEach((note: NoteWithTags) => {
    const arch = note.archived;
    hasArchivedChild[note.id] = hasArchivedChild[note.id] || arch;
    let currentNote = note;
    while (validParent(currentNote)) {
      currentNote = notes[currentNote.parent_note_id]!;
      hasArchivedChild[currentNote.id] = hasArchivedChild[currentNote.id] || arch;
    }
  });
  return hasArchivedChild;
});

const mostRecent = (a: string, b: string) => (a > b ? a : b);

export const getSortedNoteIds = createSelector(getNoteEntities, (allNotes) => {
  const map = new Map<number, string>();

  Object.values(allNotes).forEach((note: NoteWithTags) => {
    map.set(note.id, note.updated_at);
  });

  Object.values(allNotes).forEach((thisNote: NoteWithTags) => {
    let note = thisNote;
    while (validParent(note)) {
      map.set(
        note.parent_note_id,
        mostRecent(note.updated_at, map.get(note.parent_note_id || -1)!),
      );
      note = allNotes[note.parent_note_id]!;
    }
  });

  return Array.from(map.entries())
    .sort(([aid, a]: [number, string], [bid, b]: [number, string]) => {
      const na = allNotes[aid]!;
      const nb = allNotes[bid]!;

      if (na.pinned && !nb.pinned) {
        return -1;
      }
      if (!na.pinned && nb.pinned) {
        return 1;
      }

      if (na.archived && !nb.archived) {
        return 1;
      }
      if (!na.archived && nb.archived) {
        return -1;
      }

      if (a > b) {
        return -1;
      }
      if (a < b) {
        return 1;
      }
      return 0;
    })
    .map(([id, _]) => id);
});

const getNoteSearcher = createSelector(
  listNotes,
  (notes) =>
    new Fuse(notes, {
      distance: 100,
      keys: [
        {
          name: 'title',
          weight: 1.0,
        },
        {
          name: 'tags',
          weight: 0.8,
        },
        {
          name: 'body',
          weight: 0.5,
        },
      ],
      location: 0,
      shouldSort: true,
      threshold: 0.4,
    }),
);

const getSearchQuery = (_: any, { query = '' }: { query?: string }) => query;
export const getSearchResults = createSelector(getNoteSearcher, getSearchQuery, (searcher, query) =>
  searcher.search(query),
);
