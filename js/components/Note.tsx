// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import * as React from 'react';
import { Suspense } from 'react';
import { connect } from 'react-redux';
import htmlParser from 'react-markdown/plugins/html-parser';
import classNames from 'classnames';
import ReactMarkdown from 'react-markdown';

import axios from 'axios';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import EditIcon from '@material-ui/icons/Edit';
import LibraryAddIcon from '@material-ui/icons/LibraryAdd';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import DeleteIcon from '@material-ui/icons/Delete';
import ArchiveIcon from '@material-ui/icons/Archive';
import UnarchiveIcon from '@material-ui/icons/Unarchive';
import PinIcon from '@material-ui/icons/Done';
import UnpinIcon from '@material-ui/icons/Clear';
import ReactLoading from 'react-loading';
import {
  createStyles,
  withStyles,
  Theme,
  WithStyles,
} from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import withWidth, { isWidthDown } from '@material-ui/core/withWidth';

import 'codemirror/lib/codemirror.css';
import 'tui-editor/dist/tui-editor.min.css';
import 'tui-color-picker/dist/tui-color-picker.css';

import { NoteData } from 'data/types';
import BindKeyboard from 'components/BindKeyboard';
import Tags from 'components/Tags';
import AutoLink from 'components/AutoLink';
import NoteList from 'components/NoteList';
import ConfirmationDialog from 'components/ConfirmationDialog';
import { AppState } from 'data/types';
import { getLinkIds, getSubnotes } from 'data/selectors';

const NoteEditor = React.lazy(() =>
  import(/* webpackChunkName: "editor" */ 'components/NoteEditor')
);

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
    archived: {
      opacity: 0.4,
      '@media print': {
        display: 'none',
      },
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
          textIndent: theme.spacing(1),
        },
      },
      '& blockquote': {
        borderLeftWidth: 3,
        borderLeftStyle: 'solid',
        borderLeftColor: theme.palette.secondary.dark,

        paddingLeft: theme.spacing(1),
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
    loadingSpinner: {
      position: 'relative',
      left: '50%',
      top: '50%',
      marginTop: -32,
      marginLeft: -32,
    },
    contentRoot: {
      '@media print': {
        marginTop: 0,
        display: 'block',
      },
      marginTop: 75,
    },
  });

interface Props extends WithStyles<typeof styles> {
  new?: boolean;
  note: NoteData;
  search: string;
  titles: Map<string, Set<number>>;
  subnotes: Map<number, NoteData>;
  updateNote: (note?: NoteData) => void;
  deleteNote: (id: number) => void;
  width: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  depth?: number;
  matches?: {
    indices: number[][];
    value: string;
    key: string;
    arrayIndex: number;
  }[];
}

const initialState = {
  edit: false,
  creatingSubnote: false,
  moreMenuEl: null as HTMLElement,
  confirmDeleteOpen: false,
  confirmCancelEditOpen: false,
};

type State = Readonly<typeof initialState>;

class Note extends React.Component<Props, State> {
  noteEditor: React.RefObject<any>;

  constructor(props: Props) {
    super(props);
    this.state = Object.assign({}, initialState, { edit: props.new });
    this.noteEditor = React.createRef();
  }

  tryCancelEdit = () => {
    debugger;
    if (!this.noteEditor.current || !this.noteEditor.current.hasChanges()) {
      this.cancelEdit();
    } else {
      this.setState({ confirmCancelEditOpen: true });
    }
  };

  cancelEdit = () => {
    this.setState({
      edit: false,
      creatingSubnote: false,
      confirmCancelEditOpen: false,
    });
    this.props.updateNote(null);
  };

  save = async (note: {
    title: string;
    body: string;
    tags: string[];
    parent_note_id?: number;
  }) => {
    const { title, body, tags, parent_note_id } = note;
    let result;
    if (this.props.new || this.state.creatingSubnote) {
      result = await axios.put('/api/secure/note', {
        title,
        body,
        parent_note_id,
      });
    } else {
      result = await axios.patch(`/api/secure/notes/${this.props.note.id}`, {
        title,
        body,
        parent_note_id,
      });
    }

    result = await axios.put(`/api/secure/notes/${result.data.id}/tags`, tags);

    this.setState({
      edit: false,
      creatingSubnote: false,
    });

    this.props.updateNote(result.data);
  };

  doDelete = async () => {
    const { id } = this.props.note;
    let result = await axios.delete(`/api/secure/notes/${id}`);
    this.props.deleteNote(id);
  };

  archiveNote = async () => {
    this.setState({ moreMenuEl: null });

    // What even does archiving a new note mean?
    if (this.props.new) {
      return;
    }

    const { id, archived } = this.props.note;
    const result = await axios.patch(`/api/secure/notes/${id}`, {
      archived: !archived,
    });

    this.props.updateNote(result.data);
  };

  pinNote = async () => {
    this.setState({ moreMenuEl: null });

    // What even does pinning a new note mean?
    if (this.props.new) {
      return;
    }

    const { id, pinned } = this.props.note;
    const result = await axios.patch(`/api/secure/notes/${id}`, {
      pinned: !pinned,
    });

    this.props.updateNote(result.data);
  };

  startEdit = () => {
    this.setState({
      edit: true,
    });
  };

  startSubnoteCreate = () => {
    this.setState({
      creatingSubnote: true,
    });
  };

  render() {
    const { classes } = this.props;
    const parseHtml = htmlParser({
      isValidNode: (node: { type: string }) => node.type !== 'script',
    });
    const { moreMenuEl } = this.state;

    return (
      <Card
        className={classNames(classes.card, {
          [classes.unlinked]: this.props.note.user_id == 1,
          [classes.archived]: this.props.note.archived,
        })}
      >
        <CardHeader
          className={classes.cardHeader}
          avatar={this.props.note.pinned ? <PinIcon /> : null}
          title={this.props.note.title}
          action={
            this.state.edit ? null : (
              <>
                <IconButton
                  onClick={this.startSubnoteCreate}
                  className={classes.noPrint}
                  aria-label='Add Subnote'
                >
                  <LibraryAddIcon />
                </IconButton>
                <IconButton
                  onClick={this.startEdit}
                  className={classes.noPrint}
                  aria-label='Edit Note'
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={e => this.setState({ moreMenuEl: e.currentTarget })}
                  className={classes.noPrint}
                  aria-owns={moreMenuEl ? 'more-menu' : undefined}
                  aria-label='More Options'
                >
                  <MoreVertIcon />
                </IconButton>
              </>
            )
          }
        />
        <Menu
          id='more-menu'
          anchorEl={moreMenuEl}
          open={Boolean(moreMenuEl)}
          onClose={() => this.setState({ moreMenuEl: null })}
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          <MenuItem onClick={() => this.setState({ confirmDeleteOpen: true })}>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            Delete Note
          </MenuItem>
          <MenuItem onClick={this.pinNote}>
            <ListItemIcon>
              {this.props.note.pinned ? <UnpinIcon /> : <PinIcon />}
            </ListItemIcon>
            {this.props.note.pinned ? 'Unpin Note' : 'Pin Note'}
          </MenuItem>
          <MenuItem onClick={this.archiveNote}>
            <ListItemIcon>
              {this.props.note.archived ? <UnarchiveIcon /> : <ArchiveIcon />}
            </ListItemIcon>
            {this.props.note.archived ? 'Unarchive Note' : 'Archive Note'}
          </MenuItem>
        </Menu>
        <ConfirmationDialog
          open={this.state.confirmDeleteOpen}
          title={`You are about to delete note: ${this.props.note.title}`}
          onPositive={this.doDelete}
          onNegative={() => this.setState({ confirmDeleteOpen: false })}
        />
        <ConfirmationDialog
          open={this.state.confirmCancelEditOpen}
          title={`If you close this editor, you will lose your changes.`}
          onPositive={this.cancelEdit}
          onNegative={() => this.setState({ confirmCancelEditOpen: false })}
        />
        <CardContent className={classes.cardContent}>
          <Dialog
            classes={{ root: classes.markdown }}
            open={this.state.edit || this.state.creatingSubnote}
            fullWidth
            maxWidth='lg'
            fullScreen={isWidthDown('xs', this.props.width)}
            onClose={this.tryCancelEdit}
          >
            <Suspense
              fallback={
                <ReactLoading
                  type='spin'
                  className={classes.loadingSpinner}
                  color='#000000'
                />
              }
            >
              <NoteEditor
                open={this.state.edit}
                onSave={this.save}
                ref={this.noteEditor}
                note={
                  this.state.edit
                    ? this.props.note
                    : {
                        title: '',
                        body: '',
                        tags: [],
                        parent_note_id: this.props.note.id,
                      }
                }
              />
            </Suspense>
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

          <Grid container spacing={8} className={classes.contentRoot}>
            <NoteList
              parent_note_id={this.props.note.id}
              depth={(this.props.depth || 0) + 1}
              notes={this.props.subnotes}
              search={this.props.search}
              updateNote={this.props.updateNote}
              deleteNote={this.props.deleteNote}
            />
          </Grid>
        </CardContent>
      </Card>
    );
  }
}

export type InnerNote = Note;
export const Inner = Note;

const mapStateToProps = (state: AppState, props: { note: NoteData }) => ({
  titles: getLinkIds(state),
  subnotes: getSubnotes(state, { note_id: props.note.id }),
});

export default connect(mapStateToProps)(withStyles(styles)(withWidth()(Note)));
