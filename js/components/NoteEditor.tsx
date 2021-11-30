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

import BindKeyboard from 'components/BindKeyboard';
import { NoteWithTags, NewNote, UpdateNote } from 'data/types';

type Props = {
  note: NewNote | NoteWithTags;
  onSave: (note: (NewNote | UpdateNote) & Pick<NoteWithTags, 'tags'>) => void;
};

type State = Omit<NewNote, 'parent_note_id'> & Pick<NoteWithTags, 'tags'>;

export default class NoteEditor extends React.Component<Props, State> {
  editor: React.RefObject<any>;

  constructor(props: Props) {
    super(props);
    const { note } = this.props;
    const { title, body } = note;
    let tags: string[] = [];
    if ('tags' in note) {
      tags = note.tags;
    }
    this.state = { title, body, tags };
    this.editor = React.createRef();
  }

  save = (e: React.SyntheticEvent | Event) => {
    e.preventDefault();
    const { onSave, note } = this.props;
    const { title, body, tags } = this.state;
    onSave({ title, body, tags, parent_note_id: note.parent_note_id });
  };

  addTag = (tag: string) => {
    this.setState((prevState) => ({
      tags: [...prevState.tags, tag],
    }));
  };

  deleteTag = (tag: string, index: number) => {
    const { tags } = this.state;
    tags.splice(index, 1);
    this.setState({
      tags,
    });
  };

  // eslint-disable-next-line react/no-unused-class-component-methods
  hasChanges() {
    const { note } = this.props;
    const current = new Map(Object.entries(this.state));
    const initial = new Map(Object.entries(note));
    return (
      Array.from(current.keys()).filter((key: string) => current.get(key) !== initial.get(key))
        .length > 0
    );
  }

  render() {
    const { title, tags, body } = this.state;
    return (
      <BindKeyboard keys='ctrl+s' callback={this.save}>
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
                  this.setState({ title: e.target.value });
                }}
                style={{ fontSize: 'inherit' }}
              />
            }
            action={
              <IconButton onClick={this.save} size='large'>
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
              classes={{}}
              placeholder='Tags'
              fullWidth
              dataSource={['type:Location', 'type:Character']}
              value={tags}
              onAdd={this.addTag}
              onDelete={this.deleteTag}
            />
            <Editor
              initialValue={body}
              initialEditType='wysiwyg'
              ref={this.editor}
              events={{
                change: () => {
                  if (this.editor.current) {
                    this.setState({
                      body: this.editor.current.getInstance().getMarkdown(),
                    });
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
  }
}
