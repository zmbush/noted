// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import axios from 'axios';
import classNames from 'classnames';
import rehypeRaw from 'rehype-raw';

import * as React from 'react';
import { Suspense } from 'react';
import ReactLoading from 'react-loading';
import ReactMarkdown from 'react-markdown';
import { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';
import { connect } from 'react-redux';

import ArchiveIcon from '@mui/icons-material/Archive';
import UnpinIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import PinIcon from '@mui/icons-material/Done';
import EditIcon from '@mui/icons-material/Edit';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useTheme, Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';

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
  depth?: number;
}

const Note = ({
  classes,
  note,
  titles,
  depth,
  new: isNew,
  subnotes,
  search,
  updateNote,
  deleteNote,
}: Props) => {
  const [edit, setEdit] = React.useState(false);
  const [creatingSubnote, setCreatingSubnote] = React.useState(false);
  const [confirmDeleteOpen, setConfirmDeletOpen] = React.useState(false);
  const [confirmCancelEditOpen, setConfirmCancelEditOpen] = React.useState(false);
  const [moreMenuEl, setMoreMenuEl] = React.useState<HTMLElement>(null);
  const noteEditor = React.useRef<any>();
  const theme = useTheme();
  const editorFullscreen = useMediaQuery(theme.breakpoints.down('xs'));

  const cancelEdit = () => {
    setEdit(false);
    setCreatingSubnote(false);
    setConfirmCancelEditOpen(false);
    updateNote(null);
  };

  const tryCancelEdit = () => {
    if (!noteEditor.current || !noteEditor.current.hasChanges()) {
      cancelEdit();
    } else {
      setConfirmCancelEditOpen(true);
    }
  };

  const save = async (noteData: {
    title: string;
    body: string;
    tags: string[];
    parent_note_id?: number;
  }) => {
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

    setEdit(false);
    setCreatingSubnote(false);
    updateNote(result.data);
  };

  const doDelete = async () => {
    const _ = await axios.delete(`/api/secure/notes/${note.id}`);
    deleteNote(note.id);
  };

  const archiveNote = async () => {
    setMoreMenuEl(null);

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

  const pinNote = async () => {
    setMoreMenuEl(null);

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

  const startEdit = () => {
    setEdit(true);
  };

  const startSubnoteCreate = () => {
    setCreatingSubnote(true);
  };

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
                onClick={startSubnoteCreate}
                className={classes.noPrint}
                aria-label='Add Subnote'
                size='large'
              >
                <LibraryAddIcon />
              </IconButton>
              <IconButton
                onClick={startEdit}
                className={classes.noPrint}
                aria-label='Edit Note'
                size='large'
              >
                <EditIcon />
              </IconButton>
              <IconButton
                onClick={(e) => setMoreMenuEl(e.currentTarget)}
                className={classes.noPrint}
                aria-owns={moreMenuEl ? 'more-menu' : undefined}
                aria-label='More Options'
                size='large'
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
        onClose={() => setMoreMenuEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem onClick={() => setConfirmDeletOpen(true)}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          Delete Note
        </MenuItem>
        <MenuItem onClick={pinNote}>
          <ListItemIcon>{note.pinned ? <UnpinIcon /> : <PinIcon />}</ListItemIcon>
          {note.pinned ? 'Unpin Note' : 'Pin Note'}
        </MenuItem>
        <MenuItem onClick={archiveNote}>
          <ListItemIcon>{note.archived ? <UnarchiveIcon /> : <ArchiveIcon />}</ListItemIcon>
          {note.archived ? 'Unarchive Note' : 'Archive Note'}
        </MenuItem>
      </Menu>
      <ConfirmationDialog
        open={confirmDeleteOpen}
        title={`You are about to delete note: ${note.title}`}
        onPositive={doDelete}
        onNegative={() => setConfirmDeletOpen(false)}
      />
      <ConfirmationDialog
        open={confirmCancelEditOpen}
        title='If you close this editor, you will lose your changes.'
        onPositive={cancelEdit}
        onNegative={() => setConfirmCancelEditOpen(false)}
      />
      <CardContent className={classes.cardContent}>
        <Dialog
          classes={{ root: classes.markdown }}
          open={edit || creatingSubnote}
          fullWidth
          maxWidth='lg'
          fullScreen={editorFullscreen}
          onClose={tryCancelEdit}
        >
          <Suspense
            fallback={
              <ReactLoading type='spin' className={classes.loadingSpinner} color='#000000' />
            }
          >
            <NoteEditor
              open={edit}
              onSave={save}
              ref={noteEditor}
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
        <ReactMarkdown
          className={classes.markdown}
          components={markdownComponents}
          rehypePlugins={[rehypeRaw]}
        >
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
};

export type InnerNote = typeof Note;
export const Inner = Note;

const mapStateToProps = (state: AppState, props: { note: NoteData }) => ({
  titles: getLinkIds(state),
  subnotes: getSubnotes(state, { note_id: props.note.id }),
});

export default connect(mapStateToProps)(withStyles(styles)(Note));
