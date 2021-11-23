// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
import { Editor } from '@toast-ui/react-editor';
import ChipInput from 'material-ui-chip-input';
import 'tui-editor/dist/tui-editor-extColorSyntax';

import * as React from 'react';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import { createStyles, withStyles, Theme, WithStyles } from '@material-ui/core/styles';
import SaveIcon from '@material-ui/icons/Save';

import BindKeyboard from 'components/BindKeyboard';
import { NoteData } from 'data/types';

const styles = (theme: Theme) =>
  createStyles({
    editorRoot: {
      [theme.breakpoints.up('sm')]: {
        height: '84vh',
      },
      [theme.breakpoints.down('sm')]: {
        height: '100vh',
      },
    },

    titleInput: {
      width: '100%',
    },

    editorContent: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      top: '50px',
    },
  });

interface Props extends WithStyles<typeof styles> {
  note: NoteData;
  open: boolean;
  onSave: (note: { title: string; body: string; tags: string[] }) => void;
}

type State = {
  title: string;
  body: string;
  tags: string[];
  parent_note_id?: number;
};

class NoteEditor extends React.Component<Props, State> {
  editor: React.RefObject<any>;

  constructor(props: Props) {
    super(props);
    const { note } = this.props;
    const { title, body, tags, parent_note_id: parentNoteId } = note;
    this.state = { title, body, tags, parent_note_id: parentNoteId };
    this.editor = React.createRef();
  }

  componentDidUpdate(oldProps: Props) {
    const { open } = this.props;
    if (open && open !== oldProps.open) {
      const e = this.editor.current;
      if (e) {
        const inst = e.getInstance();
        inst.focus();
        inst.moveCursorToEnd();
      }
    }
  }

  save = (e: React.SyntheticEvent | Event) => {
    e.preventDefault();
    const { onSave } = this.props;
    onSave(this.state);
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
    const { classes } = this.props;
    const { title, tags, body } = this.state;
    return (
      <BindKeyboard keys='ctrl+s' callback={this.save}>
        <Card classes={{ root: classes.editorRoot }}>
          <CardHeader
            title={
              <Input
                classes={{ root: classes.titleInput }}
                value={title}
                onChange={(e) => {
                  this.setState({ title: e.target.value });
                }}
                style={{ fontSize: 'inherit' }}
              />
            }
            action={
              <IconButton onClick={this.save}>
                <SaveIcon />
              </IconButton>
            }
          />
          <CardContent classes={{ root: classes.editorContent }}>
            <ChipInput
              classes={{}}
              placeholder='Tags'
              fullWidth
              dataSource={['arc:Delmirev', 'type:Location', 'type:Character']}
              value={tags}
              onAdd={this.addTag}
              onDelete={this.deleteTag}
            />
            <Editor
              initialValue={body}
              initialEditType='wysiwyg'
              ref={this.editor}
              onChange={() => {
                if (this.editor.current) {
                  this.setState({
                    body: this.editor.current.getInstance().getMarkdown(),
                  });
                }
              }}
              height='calc(100% - 40px)'
              usageStatistics={false}
              useCommandShortcut={false}
              exts={['colorSyntax']}
            />
          </CardContent>
        </Card>
      </BindKeyboard>
    );
  }
}

export const Inner = NoteEditor;
export default withStyles(styles)(NoteEditor);
