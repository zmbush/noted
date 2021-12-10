// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import * as React from 'react';

import { Save as SaveIcon } from '@mui/icons-material';
import { Card, CardContent, CardHeader, IconButton, Input } from '@mui/material';

import BindKeyboard from 'components/core/BindKeyboard';
import ChipInput from 'components/core/ChipInput';
import MarkdownEditor from 'components/core/markdown/Editor';
import { NoteWithTags, NewNote, UpdateNote } from 'data/types';

type Props = {
  note: NewNote | NoteWithTags;
  onSave: (note: (NewNote | UpdateNote) & Pick<NoteWithTags, 'tags'>) => void;
  onModified: (isModified: boolean) => void;
};

const NoteEditor = ({ note, onSave, onModified }: Props) => {
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
          <MarkdownEditor height='calc(100% - 40px)' body={body} onChange={(v) => setBody(v())} />
        </CardContent>
      </Card>
    </BindKeyboard>
  );
};

export default NoteEditor;
