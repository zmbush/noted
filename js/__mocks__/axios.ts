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

import {
  User,
  NoteWithTags,
  ErrorData,
  NewNotePayload,
  SignInPayload,
  UpdateNotePayload,
  NewUserPayload,
} from 'data/types';

const testUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@test.com',
  created_at: '',
  updated_at: '',
};
const users: { [id: number]: User } = {
  [testUser.id]: testUser,
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
let userId = 2;
export const makeTestNote = (
  overrides: Partial<NoteWithTags> = {},
  parent: { id: number } | null = null,
): NoteWithTags => {
  id += 1;
  const thisId = overrides.id || id;
  const defaultFields: Partial<NoteWithTags> = {
    id: thisId,
    title: `Note ${thisId}`,
    tags: [`tag${thisId}`],
  };
  const parentOverride: Partial<NoteWithTags> = {};
  if (parent) {
    parentOverride.parent_note_id = parent.id;
  }
  return { ...emptyTestNote, ...defaultFields, ...overrides, ...parentOverride };
};

const noteDb: { [user_id: number]: { [note_id: number]: NoteWithTags } } = {
  [testUser.id]: {
    1: makeTestNote({ id: 1, user_id: testUser.id }),
    2: makeTestNote({ id: 2, user_id: testUser.id }),
    3: makeTestNote({ id: 3, user_id: testUser.id }),
    4: makeTestNote({ id: 4, user_id: testUser.id }),
  },
};

let currentUser: User | null = null;

const makeResponse = (d: any, config: AxiosRequestConfig, status: number = 200): AxiosResponse => ({
  data: d,
  status,
  statusText: '',
  headers: {},
  config,
});

const makeError = (code: number, message: string): { response: { data: ErrorData } } => ({
  response: {
    data: { code, message, details: '' },
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

const filterNulls = <T extends {}>(t: T) =>
  Object.fromEntries(Object.entries(t).filter(([_, v]) => v !== null));

const updateNote = withUser(
  (user: User, noteId: number, update: UpdateNotePayload): NoteWithTags => {
    const notes = getNoteDb(user);
    if (noteId in notes) {
      notes[noteId] = { ...notes[noteId], ...filterNulls(update) };
      return notes[noteId];
    }
    throw NOT_FOUND;
  },
);

const createNote = withUser((user: User, newNote: NewNotePayload): NoteWithTags => {
  const notes = getNoteDb(user);
  const newId =
    Object.keys(notes)
      .map((v) => parseInt(v, 10))
      .reduce((a, b) => (a > b ? a : b), 0) + 1;
  notes[newId] = makeTestNote({
    id: newId,
    user_id: user.id,
    ...newNote,
    parent_note_id: newNote.parent_note_id || 0,
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

const createUser = (newUser: NewUserPayload): User => {
  const user: User = { id: userId, ...newUser, created_at: '', updated_at: '' };
  userId += 1;
  users[user.id] = user;
  noteDb[user.id] = {};
  currentUser = user;
  return user;
};

export default {
  async get(url: string, config: AxiosRequestConfig): Promise<AxiosResponse> {
    if (url.endsWith('/api/secure/notes')) {
      return makeResponse(listNotes(), config);
    }
    if (url.endsWith('/api/get_user')) {
      if (currentUser) {
        return makeResponse(currentUser, config);
      }
      return makeResponse({}, config);
    }
    throw NOT_IMPLEMENTED;
  },

  async post(url: string, data: any, config: AxiosRequestConfig): Promise<AxiosResponse> {
    if (url.endsWith('/api/sign_in')) {
      const signIn = data as SignInPayload;
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
    if (urlMatch && urlMatch.groups) {
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
      return makeResponse(createUser(data), config);
    }
    const urlMatch = url.match(tagsEndpoint);
    if (urlMatch && urlMatch.groups) {
      const noteId = parseInt(urlMatch.groups.note_id, 10);
      return makeResponse(setTags(noteId, data), config);
    }
    throw NOT_IMPLEMENTED;
  },

  async delete(url: string, config: AxiosRequestConfig): Promise<AxiosResponse> {
    const urlMatch = url.match(noteEndpoint);
    if (urlMatch && urlMatch.groups) {
      const noteId = parseInt(urlMatch.groups.note_id, 10);
      return makeResponse(deleteNote(noteId), config);
    }
    throw NOT_IMPLEMENTED;
  },
};
