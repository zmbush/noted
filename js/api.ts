// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import axios from 'axios';

import {
  UpdateNote,
  NewNote,
  NoteWithTags,
  User,
  SignIn,
  NewUserRequest,
  ErrorData,
} from 'data/types';

const api = '/api';
const noteRoot = `${api}/secure/note`;

const err = (data: ErrorData) => data;

const propIsInObj = <X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y,
): obj is X & Record<Y, unknown> => prop in obj;

const mapErr = async <V>(promise: Promise<V>) => {
  try {
    return await promise;
  } catch (e) {
    if (
      e &&
      typeof e === 'object' &&
      propIsInObj(e, 'response') &&
      e.response &&
      typeof e.response === 'object' &&
      propIsInObj(e.response, 'data') &&
      e.response.data
    ) {
      throw e.response.data;
    }
    throw err({ message: 'Unknown Error', code: 500, details: JSON.stringify(e) });
  }
};

export default {
  note: {
    async create(note: NewNote): Promise<NoteWithTags> {
      return (await mapErr(axios.put(noteRoot, note))).data;
    },

    async update(noteId: number, note: UpdateNote): Promise<NoteWithTags> {
      return (await mapErr(axios.patch(`${noteRoot}s/${noteId}`, note))).data;
    },

    async delete(noteId: number) {
      return mapErr(axios.delete(`${noteRoot}s/${noteId}`));
    },

    async setTags(noteId: number, tags: string[]): Promise<NoteWithTags> {
      return (await mapErr(axios.put(`${noteRoot}s/${noteId}/tags`, tags))).data;
    },

    async list(): Promise<NoteWithTags[]> {
      return (await mapErr(axios.get('/api/secure/notes'))).data;
    },
  },

  user: {
    async get(): Promise<User> {
      return (await mapErr(axios.get(`${api}/get_user`))).data;
    },

    async signOut(): Promise<void> {
      return mapErr(axios.post(`${api}/sign_out`));
    },

    async signIn(signIn: SignIn): Promise<User> {
      return (await mapErr(axios.post(`${api}/sign_in`, signIn))).data;
    },

    async signUp(signUp: NewUserRequest): Promise<User> {
      return (await mapErr(axios.put(`${api}/sign_up`, signUp))).data;
    },
  },
};
