// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { EntityState } from '@reduxjs/toolkit';
import createCachedSelector from 're-reselect';
import { createSelector } from 'reselect';

import { prefix } from 'data/notes/api';
import { notesAdapter } from 'data/notes/slice';
import { AppState } from 'data/store';
import { NoteWithTags } from 'data/types';

export const getNotes = (state: AppState) => state[prefix];
const noteSelectors = notesAdapter.getSelectors(getNotes);
export const getNoteEntities = noteSelectors.selectEntities;
const getNoteId = (_: any, props: { note_id: number }) => props.note_id;
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

export const getTopLevelNotes = createSelector(listNotes, (notes) => {
  const topLevel: { [id: number]: NoteWithTags } = {};
  notes.forEach((note) => {
    if (!validParent(note)) {
      topLevel[note.id] = note;
    }
  });
  return topLevel;
});

export const getSubNotes = createCachedSelector(listNotes, getNoteId, (notes, noteId) => {
  const subNotes: { [id: number]: NoteWithTags } = {};

  notes.forEach((note) => {
    if (note.parent_note_id === noteId && note.id !== noteId) {
      subNotes[note.id] = note;
    }
  });

  return subNotes;
})((state, props: { note_id: number }) => props.note_id);

export type SubNoteMap = ReturnType<typeof getSubNotes>;

export const getIsNotArchived = createSelector(getNoteEntities, (notes) => {
  const isNotArchived: { [id: number]: boolean } = {};
  Object.values(notes).forEach((note) => {
    isNotArchived[note.id] = !note.archived;
  });
  return isNotArchived;
});

export const getHasArchivedChild = createSelector(getNoteEntities, (notes) => {
  const hasArchivedChild: { [id: number]: boolean } = {};
  Object.values(notes).forEach((note) => {
    const arch = note.archived;
    hasArchivedChild[note.id] = hasArchivedChild[note.id] || arch;
    let currentNote = note;
    while (validParent(currentNote)) {
      currentNote = notes[currentNote.parent_note_id];
      hasArchivedChild[currentNote.id] = hasArchivedChild[currentNote.id] || arch;
    }
  });
  return hasArchivedChild;
});

const calculateMergedNote = (
  note: NoteWithTags,
  notes: EntityState<NoteWithTags>,
): NoteWithTags => {
  const newNote = { ...note };
  const subNotes = getSubNotes({ notes }, { note_id: note.id });

  Object.values(subNotes).forEach((subNote) => {
    const mergedNote = calculateMergedNote(subNote, notes);
    newNote.title = `${newNote.title} ${mergedNote.title}`;
    newNote.tags = Array.from(new Set([...newNote.tags, ...mergedNote.tags]));
    newNote.body = `${newNote.body} ${mergedNote.body}`;
  });

  return newNote;
};

export const getSearchIndex = createSelector(getNotes, (allNotes) => {
  const result: { [id: number]: NoteWithTags } = {};
  Object.values(allNotes.entities).forEach((note) => {
    result[note.id] = calculateMergedNote(note, allNotes);
  });
  return result;
});

export const getFilteredSearchIndex = createCachedSelector(
  getSearchIndex,
  getNoteId,
  (notes, noteId) => {
    const subNotes: { [id: number]: NoteWithTags } = {};
    if (noteId == null) {
      // eslint-disable-next-line no-param-reassign
      noteId = 0;
    }

    Object.values(notes).forEach((note) => {
      if (note.parent_note_id === noteId) {
        subNotes[note.id] = note;
      }
    });

    return subNotes;
  },
)((state, props: { note_id: number }) => (props.note_id == null ? -1 : props.note_id));

const mostRecent = (a: string, b: string) => (a > b ? a : b);

export const getSortedNoteIds = createSelector(getNoteEntities, (allNotes) => {
  const map = new Map();

  Object.values(allNotes).forEach((note) => {
    map.set(note.id, note.updated_at);
  });

  Object.values(allNotes).forEach((thisNote) => {
    let note = thisNote;
    while (validParent(note)) {
      map.set(note.parent_note_id, mostRecent(note.updated_at, map.get(note.parent_note_id)));
      note = allNotes[note.parent_note_id];
    }
  });

  return Array.from(map.entries())
    .sort(([aid, a]: [number, string], [bid, b]: [number, string]) => {
      const na = allNotes[aid];
      const nb = allNotes[bid];

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
