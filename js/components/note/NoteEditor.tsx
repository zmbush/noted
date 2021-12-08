// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
import colorSyntax from '@toast-ui/editor-plugin-color-syntax';
import '@toast-ui/editor-plugin-color-syntax/dist/toastui-editor-plugin-color-syntax.css';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/react-editor';
import 'codemirror/lib/codemirror.css';
import ChipInput from 'material-ui-chip-input';
import 'tui-color-picker/dist/tui-color-picker.css';

import * as React from 'react';

import { Save as SaveIcon } from '@mui/icons-material';
import { Card, CardContent, CardHeader, IconButton, Input } from '@mui/material';

import BindKeyboard from 'components/core/BindKeyboard';
import { NoteWithTags, NewNote, UpdateNote } from 'data/types';

type Props = {
  note: NewNote | NoteWithTags;
  onSave: (note: (NewNote | UpdateNote) & Pick<NoteWithTags, 'tags'>) => void;
  onModified: (isModified: boolean) => void;
};

const NoteEditor = ({ note, onSave, onModified }: Props) => {
  const editor = React.useRef<any>();
  const [title, setTitle] = React.useState(note.title);
  const [body, setBody] = React.useState(note.body);
  let noteTags: string[] = [];
  if ('tags' in note) {
    noteTags = note.tags;
  }
  const [tags, setTags] = React.useState(noteTags);

  const notifyChanges = () => {
    const current = new Map(Object.entries({ title, body, tags }));
    const initial = new Map(Object.entries(note));
    onModified(
      Array.from(current.keys()).filter((key: string) => current.get(key) !== initial.get(key))
        .length > 0,
    );
  };

  const save = (e: React.SyntheticEvent | Event) => {
    e.preventDefault();
    onSave({ title, body, tags, parent_note_id: note.parent_note_id });
  };

  const addTag = (tag: string) => {
    setTags([...tags, tag]);
    notifyChanges();
  };

  const deleteTag = (tag: string, index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
    notifyChanges();
  };

  return (
    <BindKeyboard keys='ctrl+s' callback={save}>
      <Card
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
              onChange={(e) => {
                setTitle(e.target.value);
                notifyChanges();
              }}
              style={{ fontSize: 'inherit' }}
            />
          }
          action={
            <IconButton onClick={save} aria-label='Save Note' size='large'>
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
            data-testid='tags-input'
            classes={{}}
            placeholder='Tags'
            fullWidth
            dataSource={['type:Location', 'type:Character']}
            value={tags}
            onAdd={addTag}
            onDelete={deleteTag}
          />
          <Editor
            initialValue={body}
            initialEditType='wysiwyg'
            ref={editor}
            events={{
              change: () => {
                if (editor.current) {
                  setBody(editor.current.getInstance().getMarkdown());
                  notifyChanges();
                }
              },
            }}
            height='calc(100% - 40px)'
            usageStatistics={false}
            useCommandShortcut={false}
            plugins={[colorSyntax]}
          />
        </CardContent>
      </Card>
    </BindKeyboard>
  );
};

export default NoteEditor;
