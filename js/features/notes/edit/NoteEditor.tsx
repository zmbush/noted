// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { createSelector } from '@reduxjs/toolkit';

import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Save as SaveIcon } from '@mui/icons-material';
import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Input,
  Dialog,
  useMediaQuery,
  Theme,
} from '@mui/material';

import { AppState } from 'features/redux/store';

import BindKeyboard from 'components/BindKeyboard';
import ChipInput from 'components/ChipInput';
import ConfirmationDialog from 'components/ConfirmationDialog';
import Loading from 'components/Loading';
import { NoteWithTags, NewNotePayload } from 'data/types';

import { createNote, updateNote } from '../list/api';
import { getSingleNote } from '../list/selectors';

import { NoteEditState, prefix, setEditingNote } from './slice';

const MarkdownEditor = React.lazy(() => import('features/markdown/Editor'));

type NewNoteOrEdit = { id: 'new'; note: NewNotePayload } | { id: number; note: NoteWithTags };

const getNoteEdit = (state: AppState): NoteEditState => state[prefix];
const getEditingNote = createSelector(getNoteEdit, (noteEdit) => noteEdit.editingNote);
const getNoteBeingEdited = createSelector(
  (s: AppState) => s,
  getEditingNote,
  (state, noteEdit): NewNoteOrEdit | null => {
    if (!noteEdit) {
      return null;
    }
    if (noteEdit.id === 'new') {
      const { id, title = '', parent_note_id: parentNoteId } = noteEdit;
      const note: NewNotePayload = { title, body: '', parent_note_id: parentNoteId };
      return { id, note };
    }
    const { id } = noteEdit;
    return { id, note: getSingleNote(state, { noteId: id }) };
  },
);

const NoteEditorInner = ({ id, note }: NewNoteOrEdit) => {
  const [title, setTitle] = React.useState(note.title);
  const [body, setBody] = React.useState(note.body);
  let noteTags: string[] = [];
  if ('tags' in note) {
    noteTags = note.tags;
  }
  const [tags, setTags] = React.useState(noteTags);
  const [confirmCancelEditOpen, setConfirmCancelEditOpen] = React.useState(false);
  const editorFullscreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));
  const dispatch = useDispatch();

  const current = new Map(Object.entries({ title, body, tags }));
  const initial = new Map(Object.entries(note));
  const noteIsModified =
    Array.from(current.keys()).filter((key: string) => current.get(key) !== initial.get(key))
      .length > 0;

  const stopEditing = () => dispatch(setEditingNote(null));
  const save = async (e: React.SyntheticEvent | Event) => {
    e.preventDefault();
    stopEditing();

    if (id === 'new') {
      await dispatch(createNote({ title, body, tags, parent_note_id: note.parent_note_id }));
    } else {
      await dispatch(updateNote({ id, title, body, tags }));
    }
  };

  const tryCancelEdit = () => {
    if (noteIsModified) {
      setConfirmCancelEditOpen(true);
    } else {
      stopEditing();
    }
  };

  return (
    <>
      <ConfirmationDialog
        open={confirmCancelEditOpen}
        title='If you close this editor, you will lose your changes.'
        onPositive={stopEditing}
        onNegative={() => setConfirmCancelEditOpen(false)}
      />
      <Dialog
        open
        fullWidth
        maxWidth='lg'
        fullScreen={editorFullscreen}
        onClose={tryCancelEdit}
        data-testid='edit-note-dialog'
      >
        <BindKeyboard keys='ctrl+s' callback={save}>
          <Card
            data-testid='NoteEditor'
            sx={(theme) => ({
              [theme.breakpoints.up('sm')]: {
                height: '84vh',
              },
              [theme.breakpoints.down('md')]: {
                height: '100vh',
              },
            })}
          >
            <CardHeader
              title={
                <Input
                  sx={{ width: '100%' }}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ fontSize: 'inherit' }}
                />
              }
              action={
                <IconButton onClick={save} aria-label='Save Note' size='large' tabIndex={-1}>
                  <SaveIcon />
                </IconButton>
              }
            />
            <CardContent
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                top: '50px',
              }}
            >
              <ChipInput
                value={tags}
                onChange={setTags}
                options={['type:Location', 'type:Character']}
              />
              <React.Suspense fallback={<Loading />}>
                <MarkdownEditor
                  height='calc(100% - 50px)'
                  body={body}
                  onChange={(v) => setBody(v())}
                />
              </React.Suspense>
            </CardContent>
          </Card>
        </BindKeyboard>
      </Dialog>
    </>
  );
};

const NoteEditor = () => {
  const noteAndId = useSelector(getNoteBeingEdited);
  if (noteAndId === null) {
    return null;
  }
  const { id } = noteAndId;
  if (id === 'new') {
    const { note } = noteAndId;
    return <NoteEditorInner id='new' note={note} />;
  }
  const { note } = noteAndId;
  return <NoteEditorInner id={id} note={note} />;
};

export default NoteEditor;
