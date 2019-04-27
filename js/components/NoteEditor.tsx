// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import * as React from 'react';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import ChipInput from 'material-ui-chip-input';
import SaveIcon from '@material-ui/icons/Save';
import { NoteData } from 'data/types';

import BindKeyboard from 'components/BindKeyboard';

import {
  createStyles,
  withStyles,
  Theme,
  WithStyles,
} from '@material-ui/core/styles';

import 'tui-editor/dist/tui-editor-extColorSyntax';
import { Editor } from '@toast-ui/react-editor';

const styles = (theme: Theme) =>
  createStyles({
    root: {},

    editorRoot: {
      [theme.breakpoints.up('sm')]: {
        height: '84vh',
      },
      [theme.breakpoints.down('sm')]: {
        height: '100vh',
      },
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
    const { title, body, tags, parent_note_id } = this.props.note;
    this.state = { title, body, tags, parent_note_id };
    this.editor = React.createRef();
  }

  componentDidUpdate(oldProps: Props) {
    if (this.props.open && this.props.open != oldProps.open) {
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
    this.props.onSave(this.state);
  };

  addTag = (tag: string) => {
    this.setState({
      tags: [...this.state.tags, tag],
    });
  };

  deleteTag = (tag: string, index: number) => {
    this.state.tags.splice(index, 1);
    this.setState({
      tags: this.state.tags,
    });
  };

  render() {
    const { classes } = this.props;
    return (
      <BindKeyboard keys='ctrl+s' callback={this.save}>
        <Card classes={{ root: classes.editorRoot }}>
          <CardHeader
            title={
              <InputBase
                value={this.state.title}
                onChange={e => {
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
              value={this.state.tags}
              onAdd={this.addTag}
              onDelete={this.deleteTag}
            />
            <Editor
              initialValue={this.state.body}
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
