// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
import createCachedSelector from 're-reselect';
import { createSelector } from 'reselect';

import { NoteWithTags } from 'data/api_types';
import { AppState } from 'data/reducers';

const getNotes = (state: AppState) => state.notes;
const getNoteId = (_: any, props: { note_id: number }) => props.note_id;

const listNotes = createSelector(getNotes, (notes: Map<number, NoteWithTags>) =>
  Array.from(notes.values()),
);

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
    if (titles.has(titlePart)) {
      titles.get(titlePart).add(id);
    } else {
      titles.set(titlePart, new Set([id]));
    }
    return titles;
  }, new Map<string, Set<number>>()),
);

export type LinkIdMap = ReturnType<typeof getLinkIds>;

export const getTopLevelNotes = createSelector(listNotes, (notes) => {
  const topLevel = new Map();
  notes.forEach((note) => {
    if (!validParent(note)) {
      topLevel.set(note.id, note);
    }
  });
  return topLevel;
});

export const getSubNotes = createCachedSelector(listNotes, getNoteId, (notes, noteId) => {
  const subNotes = new Map();

  [...notes.values()].forEach((note) => {
    if (note.parent_note_id === noteId && note.id !== noteId) {
      subNotes.set(note.id, note);
    }
  });

  return subNotes;
})((state, props: { note_id: number }) => props.note_id);

export type SubNoteMap = ReturnType<typeof getSubNotes>;

const calculateMergedNote = (
  note: NoteWithTags,
  notes: Map<number, NoteWithTags>,
): NoteWithTags => {
  const newNote = { ...note };
  const subNotes = getSubNotes({ notes }, { note_id: note.id });

  [...subNotes.values()].forEach((subNote) => {
    const mergedNote = calculateMergedNote(subNote, notes);
    newNote.title = `${newNote.title} ${mergedNote.title}`;
    newNote.tags = Array.from(new Set([...newNote.tags, ...mergedNote.tags]));
    newNote.body = `${newNote.body} ${mergedNote.body}`;
  });

  return newNote;
};

export const getSearchIndex = createSelector(getNotes, (allNotes) => {
  const result = new Map();
  [...allNotes.values()].forEach((note) => {
    result.set(note.id, calculateMergedNote(note, allNotes));
  });
  return result;
});

export const getFilteredSearchIndex = createCachedSelector(
  getSearchIndex,
  getNoteId,
  (notes, noteId) => {
    const subNotes = new Map();
    if (noteId == null) {
      // eslint-disable-next-line no-param-reassign
      noteId = 0;
    }

    [...notes.values()].forEach((note) => {
      if (note.parent_note_id === noteId) {
        subNotes.set(note.id, note);
      }
    });

    return subNotes;
  },
)((state, props: { note_id: number }) => (props.note_id == null ? -1 : props.note_id));

const mostRecent = (a: string, b: string) => (a > b ? a : b);

export const getSortedNoteIds = createSelector(getNotes, (allNotes) => {
  const map = new Map();

  [...allNotes.values()].forEach((note) => {
    map.set(note.id, note.updated_at);
  });

  [...allNotes.values()].forEach((thisNote) => {
    let note = thisNote;
    while (validParent(note)) {
      map.set(note.parent_note_id, mostRecent(note.updated_at, map.get(note.parent_note_id)));
      note = allNotes.get(note.parent_note_id);
    }
  });

  return Array.from(map.entries())
    .sort(([aid, a]: [number, string], [bid, b]: [number, string]) => {
      const na = allNotes.get(aid);
      const nb = allNotes.get(bid);

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
