// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//

/* eslint-disable no-throw-literal */
import { AxiosRequestConfig, AxiosResponse } from 'axios';

import { ErrorData, NoteWithTags, SignIn, UpdateNote, User } from 'data/types';

const testUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@test.com',
  created_at: '',
  updated_at: '',
};

export const emptyTestNote: NoteWithTags = {
  id: -1,
  user_id: -1,
  title: 'The Note',
  body: 'The Body',
  tags: [],
  archived: false,
  pinned: false,
  parent_note_id: 0,
  created_at: '',
  updated_at: '',
};

let id = 0;
export const makeTestNote = (
  overrides: Partial<NoteWithTags> = {},
  parent: { id: number } = null,
): NoteWithTags => {
  id += 1;
  const thisId = overrides.id || id;
  const defaultFields: Partial<NoteWithTags> = {
    id: thisId,
    title: `Note ${thisId}`,
  };
  const parentOverride: Partial<NoteWithTags> = {};
  if (parent) {
    parentOverride.parent_note_id = parent.id;
  }
  return { ...emptyTestNote, ...defaultFields, ...overrides, ...parentOverride };
};

const noteDb: { [user_id: number]: { [note_id: number]: NoteWithTags } } = {
  [testUser.id]: {
    1: makeTestNote({ id: 1 }),
    2: makeTestNote({ id: 2 }),
    3: makeTestNote({ id: 3 }),
    4: makeTestNote({ id: 4 }),
  },
};

let currentUser: User | null = null;

const makeResponse = (d: any, config: AxiosRequestConfig, status: number = 200): AxiosResponse => ({
  data: d,
  status,
  statusText: '',
  headers: null,
  config,
});

const makeError = (code: number, error: string): { response: { data: ErrorData } } => ({
  response: {
    data: { code, error },
  },
});

const noteEndpoint = /\/api\/secure\/notes\/(?<note_id>\d+)/;

export default {
  async get(url: string, config: AxiosRequestConfig): Promise<AxiosResponse> {
    if (url.endsWith('/api/secure/notes')) {
      if (currentUser && currentUser.id in noteDb) {
        return makeResponse(Object.values(noteDb[currentUser.id]), config);
      }
      throw makeError(401, 'NotSignedIn');
    }
    throw makeError(500, 'Not Implemented');
  },

  async post(url: string, data: any, config: AxiosRequestConfig): Promise<AxiosResponse> {
    if (url.endsWith('/api/sign_in')) {
      const signIn = data as SignIn;
      if (signIn.email === testUser.email && signIn.password === 'pass') {
        currentUser = testUser;
        return makeResponse(currentUser, config);
      }
      throw makeError(404, 'NotFound');
    }
    if (url.endsWith('/api/sign_out')) {
      currentUser = testUser;
      return makeResponse('ok', config);
    }
    throw makeError(500, 'Not Implemented');
  },

  async patch(url: string, data: any, config: AxiosRequestConfig): Promise<AxiosResponse> {
    const urlMatch = url.match(noteEndpoint);
    if (urlMatch.groups) {
      const noteId = parseInt(urlMatch.groups.note_id, 10);
      const updateNote = data as UpdateNote;
      if (currentUser && currentUser.id in noteDb) {
        const notes = noteDb[currentUser.id];
        if (noteId in notes) {
          notes[noteId] = { ...notes[noteId], ...updateNote };
          return makeResponse(notes[noteId], config);
        }
      }
      throw makeError(404, 'NotFound');
    }
    throw makeError(500, 'Not Implemented');
  },
};
