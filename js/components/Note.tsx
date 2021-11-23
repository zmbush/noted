// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
import axios from 'axios';
import classNames from 'classnames';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'codemirror/lib/codemirror.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'tui-color-picker/dist/tui-color-picker.css';
// eslint-disable-next-line import/extensions
import 'tui-editor/dist/tui-editor.min.css';

import * as React from 'react';
import { Suspense } from 'react';
import ReactLoading from 'react-loading';
import ReactMarkdown from 'react-markdown';
import { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';
import { connect } from 'react-redux';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { createStyles, withStyles, Theme, WithStyles } from '@material-ui/core/styles';
import withWidth, { isWidthDown } from '@material-ui/core/withWidth';
import ArchiveIcon from '@material-ui/icons/Archive';
import UnpinIcon from '@material-ui/icons/Clear';
import DeleteIcon from '@material-ui/icons/Delete';
import PinIcon from '@material-ui/icons/Done';
import EditIcon from '@material-ui/icons/Edit';
import LibraryAddIcon from '@material-ui/icons/LibraryAdd';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import UnarchiveIcon from '@material-ui/icons/Unarchive';

import AutoLink from 'components/AutoLink';
import ConfirmationDialog from 'components/ConfirmationDialog';
import NoteList from 'components/NoteList';
import Tags from 'components/Tags';
import { getLinkIds, getSubnotes } from 'data/selectors';
import { NoteData, AppState } from 'data/types';

const NoteEditor = React.lazy(
  () => import(/* webpackChunkName: "editor" */ 'components/NoteEditor'),
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
        // pageBreakInside: 'avoid',
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
          // pageBreakInside: 'avoid',
          // display: 'inline-block',
          // margin: 0,
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
    this.state = { ...initialState, edit: props.new };
    this.noteEditor = React.createRef();
  }

  tryCancelEdit = () => {
    if (!this.noteEditor.current || !this.noteEditor.current.hasChanges()) {
      this.cancelEdit();
    } else {
      this.setState({ confirmCancelEditOpen: true });
    }
  };

  cancelEdit = () => {
    const { updateNote } = this.props;
    this.setState({
      edit: false,
      creatingSubnote: false,
      confirmCancelEditOpen: false,
    });
    updateNote(null);
  };

  save = async (noteData: {
    title: string;
    body: string;
    tags: string[];
    parent_note_id?: number;
  }) => {
    const { new: isNew, note, updateNote } = this.props;
    const { creatingSubnote } = this.state;
    const { title, body, tags, parent_note_id: parentNoteId } = noteData;
    let result;
    if (isNew || creatingSubnote) {
      result = await axios.put('/api/secure/note', {
        title,
        body,
        parent_note_id: parentNoteId,
      });
    } else {
      result = await axios.patch(`/api/secure/notes/${note.id}`, {
        title,
        body,
        parent_note_id: parentNoteId,
      });
    }

    result = await axios.put(`/api/secure/notes/${result.data.id}/tags`, tags);

    this.setState({
      edit: false,
      creatingSubnote: false,
    });

    updateNote(result.data);
  };

  doDelete = async () => {
    const { note, deleteNote } = this.props;
    const _ = await axios.delete(`/api/secure/notes/${note.id}`);
    deleteNote(note.id);
  };

  archiveNote = async () => {
    const { new: isNew, note, updateNote } = this.props;
    this.setState({ moreMenuEl: null });

    // What even does archiving a new note mean?
    if (isNew) {
      return;
    }

    const { id, archived } = note;
    const result = await axios.patch(`/api/secure/notes/${id}`, {
      archived: !archived,
    });

    updateNote(result.data);
  };

  pinNote = async () => {
    const { new: isNew, note, updateNote } = this.props;
    this.setState({ moreMenuEl: null });

    // What even does pinning a new note mean?
    if (isNew) {
      return;
    }

    const { id, pinned } = note;
    const result = await axios.patch(`/api/secure/notes/${id}`, {
      pinned: !pinned,
    });

    updateNote(result.data);
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
    const { classes, note, width, titles, depth, subnotes, search, updateNote, deleteNote } =
      this.props;
    const { edit, confirmDeleteOpen, confirmCancelEditOpen, creatingSubnote } = this.state;
    const { moreMenuEl } = this.state;
    const markdownComponents: ReactMarkdownOptions['components'] = {
      // eslint-disable-next-line react/no-unstable-nested-components
      p: ({ children }) => (
        <p>
          <AutoLink titles={titles}>{children}</AutoLink>
        </p>
      ),
    };

    return (
      <Card
        className={classNames(classes.card, {
          [classes.unlinked]: note.user_id === 1,
          [classes.archived]: note.archived,
        })}
      >
        <CardHeader
          className={classes.cardHeader}
          avatar={note.pinned ? <PinIcon /> : null}
          title={note.title}
          action={
            edit ? null : (
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
                  onClick={(e) => this.setState({ moreMenuEl: e.currentTarget })}
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
            <ListItemIcon>{note.pinned ? <UnpinIcon /> : <PinIcon />}</ListItemIcon>
            {note.pinned ? 'Unpin Note' : 'Pin Note'}
          </MenuItem>
          <MenuItem onClick={this.archiveNote}>
            <ListItemIcon>{note.archived ? <UnarchiveIcon /> : <ArchiveIcon />}</ListItemIcon>
            {note.archived ? 'Unarchive Note' : 'Archive Note'}
          </MenuItem>
        </Menu>
        <ConfirmationDialog
          open={confirmDeleteOpen}
          title={`You are about to delete note: ${note.title}`}
          onPositive={this.doDelete}
          onNegative={() => this.setState({ confirmDeleteOpen: false })}
        />
        <ConfirmationDialog
          open={confirmCancelEditOpen}
          title='If you close this editor, you will lose your changes.'
          onPositive={this.cancelEdit}
          onNegative={() => this.setState({ confirmCancelEditOpen: false })}
        />
        <CardContent className={classes.cardContent}>
          <Dialog
            classes={{ root: classes.markdown }}
            open={edit || creatingSubnote}
            fullWidth
            maxWidth='lg'
            fullScreen={isWidthDown('xs', width)}
            onClose={this.tryCancelEdit}
          >
            <Suspense
              fallback={
                <ReactLoading type='spin' className={classes.loadingSpinner} color='#000000' />
              }
            >
              <NoteEditor
                open={edit}
                onSave={this.save}
                ref={this.noteEditor}
                note={
                  edit
                    ? note
                    : {
                        title: '',
                        body: '',
                        tags: [],
                        parent_note_id: note.id,
                      }
                }
              />
            </Suspense>
          </Dialog>
          <Tags tags={note.tags} />
          <ReactMarkdown className={classes.markdown} components={markdownComponents}>
            {note.body}
          </ReactMarkdown>

          <Grid container spacing={8} className={classes.contentRoot}>
            <NoteList
              parent_note_id={note.id}
              depth={(depth || 0) + 1}
              notes={subnotes}
              search={search}
              updateNote={updateNote}
              deleteNote={deleteNote}
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
