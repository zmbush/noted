// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import * as PropTypes from 'prop-types';
import * as React from 'react';
import { Suspense } from 'react';
import * as ReactMarkdown from 'react-markdown';
import * as htmlParser from 'react-markdown/plugins/html-parser';
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
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import {
  createStyles,
  withStyles,
  Theme,
  WithStyles,
} from '@material-ui/core/styles';

import 'codemirror/lib/codemirror.css';
import 'tui-editor/dist/tui-editor.min.css';
import 'tui-color-picker/dist/tui-color-picker.css';

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
    editorRoot: {
      height: '84vh',
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

const Editor = React.lazy(() => {
  import(
    /* webpackChunkName: "editor" */ 'tui-editor/dist/tui-editor-extColorSyntax'
  );
  return import(/* webpackChunkName: "editor" */ '@toast-ui/react-editor').then(
    module => ({ default: module.Editor })
  );
});

class Note extends React.Component<Props, State> {
  editor: React.RefObject<any>;

  constructor(props: Props) {
    super(props);
    this.state = initialState;
    this.editor = React.createRef();
  }

  cancelEdit = (e: React.SyntheticEvent | Event | React.SyntheticEvent<{}>) => {
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
        let e = this.editor.current;
        //e.getInstance().focus();
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
    const parseHtml = htmlParser({
      isValidNode: (node: { type: string }) => node.type !== 'script',
    });

    return (
      <Card
        className={classNames(classes.card, {
          [classes.unlinked]: this.props.note.user_id == 1,
        })}
      >
        <CardHeader
          className={classes.cardHeader}
          title={this.props.note.title}
          action={
            this.state.edit ? null : (
              <IconButton onClick={this.startEdit} className={classes.noPrint}>
                <EditIcon />
              </IconButton>
            )
          }
        />
        <CardContent className={classes.cardContent}>
          <Dialog
            classes={{ root: classes.markdown }}
            open={this.state.edit}
            fullWidth
            maxWidth='lg'
            onClose={this.cancelEdit}
          >
            <BindKeyboard keys='ctrl+s' callback={this.saveShortcut}>
              <Card classes={{ root: classes.editorRoot }}>
                <Suspense fallback={<div>Loading...</div>}>
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
                            body: this.editor.current
                              .getInstance()
                              .getMarkdown(),
                          });
                        }
                      }}
                      height='calc(100% - 40px)'
                      usageStatistics={false}
                      useCommandShortcut={false}
                      exts={['colorSyntax']}
                    />
                  </CardContent>
                </Suspense>
              </Card>
            </BindKeyboard>
          </Dialog>
          <Tags tags={this.props.note.tags} />
          <ReactMarkdown
            className={classes.markdown}
            renderers={{
              text: props => <AutoLink titles={this.props.titles} {...props} />,
            }}
            escapeHtml={false}
            astPlugins={[parseHtml]}
          >
            {this.props.note.body}
          </ReactMarkdown>
        </CardContent>
      </Card>
    );
  }
}

export type InnerNote = Note;

export default withStyles(styles)(Note);
