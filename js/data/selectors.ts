// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import { createSelector } from 'reselect';
import { NoteData } from 'data/types';

const listNotes = (notes: Map<number, NoteData>) => Array.from(notes.values());

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
          titles.push([title, id]);
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
