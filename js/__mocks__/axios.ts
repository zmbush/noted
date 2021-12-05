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

import { ErrorData, NewNote, NoteWithTags, SignIn, UpdateNote, User } from 'data/types';

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

const NOT_IMPLEMENTED = makeError(500, 'Not Implemented');
const NOT_FOUND = makeError(404, 'NotFound');
const NOT_AUTHORIZED = makeError(401, 'NotSignedIn');

const noteEndpoint = /\/api\/secure\/notes\/(?<note_id>\d+)/;
const tagsEndpoint = /\/api\/secure\/notes\/(?<note_id>\d+)\/tags/;

const getNoteDb = (user: User) => {
  if (!(user.id in noteDb)) {
    noteDb[user.id] = {};
  }
  return noteDb[user.id];
};

const withUser =
  <V, A extends any[]>(inner: (user: User, ...args: A) => V) =>
  (...args: A): V => {
    if (!currentUser) {
      throw NOT_AUTHORIZED;
    }
    return inner(currentUser, ...args);
  };

const listNotes = withUser((user: User): NoteWithTags[] => Object.values(getNoteDb(user)));

const updateNote = withUser((user: User, noteId: number, update: UpdateNote): NoteWithTags => {
  const notes = getNoteDb(user);
  if (noteId in notes) {
    notes[noteId] = { ...notes[noteId], ...update };
    return notes[noteId];
  }
  throw NOT_FOUND;
});

const createNote = withUser((user: User, newNote: NewNote): NoteWithTags => {
  const notes = getNoteDb(user);
  const newId =
    Object.keys(notes)
      .map((v) => parseInt(v, 10))
      .reduce((a, b) => (a > b ? a : b), 0) + 1;
  notes[newId] = makeTestNote({
    id: newId,
    user_id: currentUser.id,
    ...newNote,
  });
  return notes[newId];
});

const deleteNote = withUser((user: User, noteId: number) => {
  const notes = getNoteDb(user);
  delete notes[noteId];
});

const setTags = withUser((user: User, noteId: number, tags: string[]): NoteWithTags => {
  const notes = getNoteDb(user);
  if (noteId in notes) {
    notes[noteId].tags = tags;
    return notes[noteId];
  }
  throw NOT_FOUND;
});

export default {
  async get(url: string, config: AxiosRequestConfig): Promise<AxiosResponse> {
    if (url.endsWith('/api/secure/notes')) {
      return makeResponse(listNotes(), config);
    }
    if (url.endsWith('/api/get_user')) {
      if (currentUser) {
        return makeResponse(currentUser, config);
      }
      throw NOT_AUTHORIZED;
    }
    throw NOT_IMPLEMENTED;
  },

  async post(url: string, data: any, config: AxiosRequestConfig): Promise<AxiosResponse> {
    if (url.endsWith('/api/sign_in')) {
      const signIn = data as SignIn;
      if (signIn.email === testUser.email && signIn.password === 'pass') {
        currentUser = testUser;
        return makeResponse(currentUser, config);
      }
      throw NOT_FOUND;
    }
    if (url.endsWith('/api/sign_out')) {
      currentUser = testUser;
      return makeResponse('ok', config);
    }
    throw NOT_IMPLEMENTED;
  },

  async patch(url: string, data: any, config: AxiosRequestConfig): Promise<AxiosResponse> {
    const urlMatch = url.match(noteEndpoint);
    if (urlMatch.groups) {
      const noteId = parseInt(urlMatch.groups.note_id, 10);
      return makeResponse(updateNote(noteId, data), config);
    }
    throw NOT_IMPLEMENTED;
  },

  async put(url: string, data: any, config: AxiosRequestConfig): Promise<AxiosResponse> {
    if (url.endsWith('/api/secure/note')) {
      return makeResponse(createNote(data), config);
    }
    if (url.endsWith('/api/sign_up')) {
      throw NOT_IMPLEMENTED;
    }
    const urlMatch = url.match(tagsEndpoint);
    if (urlMatch.groups) {
      const noteId = parseInt(urlMatch.groups.note_id, 10);
      return makeResponse(setTags(noteId, data), config);
    }
    throw NOT_IMPLEMENTED;
  },

  async delete(url: string, config: AxiosRequestConfig): Promise<AxiosResponse> {
    const urlMatch = url.match(noteEndpoint);
    if (urlMatch.groups) {
      const noteId = parseInt(urlMatch.groups.note_id, 10);
      return makeResponse(deleteNote(noteId), config);
    }
    throw NOT_IMPLEMENTED;
  },
};
