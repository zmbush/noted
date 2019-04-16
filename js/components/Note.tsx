// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import * as PropTypes from 'prop-types';
import * as React from 'react';
import * as ReactMarkdown from 'react-markdown';
import classNames from 'classnames';

import axios from 'axios';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder';
import DeleteIcon from '@material-ui/icons/Delete';
import ChipInput from 'material-ui-chip-input';
import InputBase from '@material-ui/core/InputBase';
import {
  createStyles,
  withStyles,
  Theme,
  WithStyles,
} from '@material-ui/core/styles';

import 'codemirror/lib/codemirror.css';
import 'tui-editor/dist/tui-editor.min.css';
//import 'tui-editor/dist/tui-editor-contents.min.css';
import { Editor } from '@toast-ui/react-editor';

import { NoteData } from 'data/types';
import BindKeyboard from 'components/BindKeyboard';
import Tags from 'components/Tags';
import AutoLink from 'components/AutoLink';

const styles = (theme: Theme) =>
  createStyles({
    bodyRoot: {
      width: '100%',
    },
    card: {
      '@media print': {
        border: 'none',
        boxShadow: 'none',
        //pageBreakInside: 'avoid',
      },
    },
    unlinked: {
      border: '5px solid red',
    },
    bodyEditor: {
      fontFamily: 'Roboto Mono',
    },
    markdown: {
      '& p': {
        '@media print': {
          //pageBreakInside: 'avoid',
          //display: 'inline-block',
          //margin: 0,
          textIndent: theme.spacing.unit,
        },
      },
      '& blockquote': {
        borderLeftWidth: 3,
        borderLeftStyle: 'solid',
        borderLeftColor: theme.palette.secondary.dark,

        paddingLeft: theme.spacing.unit,
        '@media print': {
          margin: 0,
        },
      },
      '& a': {
        '@media print': {
          textDecoration: 'none',
          color: 'black',
        },
      },
      '& table': {
        borderCollapse: 'collapse',
        borderSpacing: 0,
        width: '100%',

        '& thead': {
          fontWeight: 800,
          display: 'table-row-group',

          '& th': {
            verticalAlign: 'bottom',
            paddingBottom: '.3em',
            paddingLeft: '.1em',
            paddingRight: '.1em',
          },
        },
        '& tbody': {
          '& tr:nth-child(2n+1)': {
            backgroundColor: '#E0E5C1',
          },
        },
      },
      '@media print': {
        '& h1, & h2, & h3, & h4, & h5': {
          color: '#58180D',
        },
        '& h1': {
          fontSize: '.705cm',
        },
        '& h2': {
          fontSize: '.529cm',
          borderBottom: '2px solid #c9ad6a',
        },
        '& h3': {
          fontSize: '.458cm',
          marginBottom: 0,
        },
        '& h4': {
          fontSize: '.423cm',
          marginBottom: '.2em',
        },
      },
    },
    noPrint: {
      '@media print': {
        display: 'none',
      },
    },
    cardHeader: {
      '@media print': {
        paddingBottom: 0,
        paddingTop: 0,
        '& span': {
          color: '#58180D',
          fontSize: '.987cm',
        },
      },
    },
    cardContent: {
      '@media print': {
        paddingTop: 0,
      },
    },
  });

const editorToolbarConfig = {
  options: ['inline', 'blockType', 'list', 'link', 'remove', 'history'],
  inline: {
    options: ['bold', 'italic', 'strikethrough'],
  },
};

const draftMarkdownOptions = {
  styleItems: {
    'color-red': {
      open: () => '<span class="style-red">',
      close: () => '</span>',
    },
  },
  remarkablePreset: 'full',
  remarkableOptions: { html: true, linkify: true, typographer: true },
};

/*const toMarkdown = (editorState: EditorState) =>
  draftToMarkdown(
    convertToRaw(editorState.getCurrentContent()),
    draftMarkdownOptions
  );

const toDraft = (markdown: string) =>
  EditorState.createWithContent(
    convertFromRaw(markdownToDraft(markdown, draftMarkdownOptions))
    );*/

interface Props extends WithStyles<typeof styles> {
  new?: boolean;
  note: NoteData;
  titles: Map<string, Set<number>>;
  updateNote: (note?: { id: number }) => void;
  matches?: {
    indices: number[][];
    value: string;
    key: string;
    arrayIndex: number;
  }[];
}

const initialState = {
  edit: false,
  title: '',
  body: '',
  tags: new Array<String>(),
};

type State = Readonly<typeof initialState>;

class Note extends React.Component<Props, State> {
  mainInput: React.RefObject<HTMLInputElement>;
  editor: React.RefObject<Editor>;

  constructor(props: Props) {
    super(props);
    this.state = initialState;
    this.mainInput = React.createRef();
    this.editor = React.createRef();
  }

  cancelEdit = (e: React.SyntheticEvent | Event) => {
    e.preventDefault();
    if (this.state.body == this.props.note.body) {
      this.setState({ edit: false });
      this.props.updateNote(null);
    }
  };

  saveShortcut = (e: React.SyntheticEvent | Event) => {
    e.preventDefault();
    this.save();
  };

  save = async () => {
    let result;
    if (this.props.new) {
      result = await axios.put('/api/secure/note', {
        title: this.state.title,
        body: this.state.body,
      });
    } else {
      result = await axios.patch(`/api/secure/notes/${this.props.note.id}`, {
        title: this.state.title,
        body: this.state.body,
      });
    }

    result = await axios.put(
      `/api/secure/notes/${result.data.id}/tags`,
      this.state.tags
    );

    this.setState({
      edit: false,
    });

    this.props.updateNote(result.data);
  };

  startEdit = () => {
    this.setState(
      {
        title: this.props.note.title,
        body: this.props.note.body,
        tags: this.props.note.tags,
        edit: true,
      },
      () => {
        let e = this.mainInput.current;
        e.focus();
        e.setSelectionRange(e.value.length, e.value.length);
      }
    );
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
      <BindKeyboard keys='ctrl+s' callback={this.saveShortcut}>
        <BindKeyboard keys='esc' callback={this.cancelEdit}>
          <Card
            className={classNames(classes.card, {
              [classes.unlinked]: this.props.note.user_id == 1,
            })}
          >
            <CardHeader
              className={classes.cardHeader}
              title={
                this.state.edit ? (
                  <InputBase
                    value={this.state.title}
                    onChange={e => {
                      this.setState({ title: e.target.value });
                    }}
                    style={{ fontSize: 'inherit' }}
                  />
                ) : (
                  this.props.note.title
                )
              }
              action={
                this.state.edit ? (
                  <IconButton onClick={this.save}>
                    <SaveIcon />
                  </IconButton>
                ) : (
                  <IconButton
                    onClick={this.startEdit}
                    className={classes.noPrint}
                  >
                    <EditIcon />
                  </IconButton>
                )
              }
            />
            <CardContent className={classes.cardContent}>
              {this.state.edit ? (
                <>
                  <ChipInput
                    classes={{}}
                    placeholder='Tags'
                    fullWidth
                    dataSource={[
                      'arc:Delmirev',
                      'type:Location',
                      'type:Character',
                    ]}
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
                          body: this.editor.current.editorInst.getMarkdown(),
                        });
                      }
                    }}
                    height='auto'
                    usageStatistics={false}
                  />
                  <div style={{ display: 'none' }}>
                    <InputBase
                      inputRef={this.mainInput}
                      value={this.state.body}
                      onChange={e => {
                        this.setState({
                          body: e.target.value,
                        });
                      }}
                      style={{ fontSize: 'inherit' }}
                      classes={{
                        root: classes.bodyRoot,
                        multiline: classes.bodyEditor,
                      }}
                      multiline
                      rows={15}
                    />
                  </div>
                </>
              ) : (
                <>
                  <Tags tags={this.props.note.tags} />
                  <ReactMarkdown
                    className={classes.markdown}
                    renderers={{
                      text: props => (
                        <AutoLink titles={this.props.titles} {...props} />
                      ),
                    }}
                  >
                    {this.props.note.body}
                  </ReactMarkdown>
                </>
              )}
            </CardContent>
          </Card>
        </BindKeyboard>
      </BindKeyboard>
    );
  }
}

export type InnerNote = Note;

export default withStyles(styles)(Note);
