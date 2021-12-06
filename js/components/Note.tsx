// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import rehypeRaw from 'rehype-raw';

import * as React from 'react';
import { Suspense } from 'react';
import ReactLoading from 'react-loading';
import ReactMarkdown from 'react-markdown';
import { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';
import { useDispatch, useSelector } from 'react-redux';

import {
  Archive as ArchiveIcon,
  Clear as UnpinIcon,
  Delete as DeleteIcon,
  Done as PinIcon,
  Edit as EditIcon,
  LibraryAdd as LibraryAddIcon,
  MoreVert as MoreVertIcon,
  Unarchive as UnarchiveIcon,
} from '@mui/icons-material';
import {
  Card,
  CardContent,
  CardHeader,
  Dialog,
  Grid,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import AutoLink from 'components/AutoLink';
import ConfirmationDialog from 'components/ConfirmationDialog';
import Loading from 'components/Loading';
import * as styles from 'components/Note.tsx.scss';
import NoteList from 'components/NoteList';
import Tags from 'components/Tags';
import { createNote, deleteNote, updateNote } from 'data/notes/api';
import { getLinkIds, getSubNotes } from 'data/notes/selectors';
import { AppState } from 'data/store';
import { NewNote, UpdateNote, NoteWithTags } from 'data/types';
import { getIsNoteChanging } from 'data/ui/selectors';

const NoteEditor = React.lazy(
  () => import(/* webpackChunkName: "editor" */ 'components/NoteEditor'),
);

type NoteContentsProps = {
  note: NoteWithTags;
  titles: { [title: string]: Set<number> };
  setEdit: (edit: boolean) => void;
  setCreatingSubNote: (creatingSubNote: boolean) => void;
  search: string;
  subNotes: { [id: number]: NoteWithTags };
  depth?: number;
};

export const NoteContents = ({
  note,
  setEdit,
  setCreatingSubNote,
  titles,
  search,
  subNotes,
  depth,
}: NoteContentsProps) => {
  const [moreMenuEl, setMoreMenuEl] = React.useState<HTMLElement>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
  const dispatch = useDispatch();
  const noteChanging = useSelector((state: AppState) => getIsNoteChanging(state, note));

  const doDelete = () => dispatch(deleteNote(note.id));

  const archiveNote = async () => {
    setMoreMenuEl(null);

    const { id, archived } = note;
    await dispatch(updateNote({ id, archived: !archived }));
  };

  const pinNote = async () => {
    setMoreMenuEl(null);

    const { id, pinned } = note;
    await dispatch(updateNote({ id, pinned: !pinned }));
  };

  const startEdit = () => {
    setEdit(true);
  };

  const startSubNoteCreate = () => {
    setCreatingSubNote(true);
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
      raised
      sx={[
        {
          marginBottom: 1,
          position: 'relative',
          '@media print': {
            border: 'none',
            boxShadow: 'none',
            // pageBreakInside: 'avoid',
          },
        },
        note.user_id === 1
          ? {
              border: '5px',
              borderColor: 'red',
            }
          : {},
        note.archived
          ? {
              opacity: 0.4,
              '@media print': {
                display: 'none',
              },
            }
          : {},
      ]}
    >
      <CardHeader
        sx={{
          '@media print': {
            paddingBottom: 0,
            paddingTop: 0,
            '& span': {
              color: '#58180d',
              fontSize: '0.987cm',
            },
          },
        }}
        avatar={note.pinned ? <PinIcon /> : null}
        title={note.title}
        action={
          <>
            <IconButton
              onClick={startSubNoteCreate}
              sx={{ displayPrint: 'none' }}
              aria-label='Add SubNote'
              size='large'
            >
              <LibraryAddIcon />
            </IconButton>
            <IconButton
              onClick={startEdit}
              sx={{ displayPrint: 'none' }}
              aria-label='Edit Note'
              size='large'
            >
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={(e) => setMoreMenuEl(e.currentTarget)}
              sx={{ displayPrint: 'none' }}
              aria-owns={moreMenuEl ? 'more-menu' : undefined}
              aria-label='More Options'
              size='large'
            >
              <MoreVertIcon />
            </IconButton>
          </>
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
        <MenuItem onClick={() => setConfirmDeleteOpen(true)}>
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
        onNegative={() => setConfirmDeleteOpen(false)}
      />
      <Loading
        in={noteChanging}
        timeout={1000}
        sx={{
          position: 'absolute',
          margin: 'auto',
          width: 80,
          height: 80,
          left: 0,
          right: 0,
          top: 40,
        }}
      />
      <CardContent sx={{ paddingTop: 0 }}>
        <Tags tags={note.tags} />
        <ReactMarkdown
          className={styles.markdown}
          components={markdownComponents}
          rehypePlugins={[rehypeRaw]}
        >
          {note.body}
        </ReactMarkdown>
        <Grid
          container
          sx={{
            marginTop: 4,
            '@media print': {
              marginTop: 0,
              display: 'block',
            },
          }}
        >
          <NoteList
            parent_note_id={note.id}
            depth={(depth || 0) + 1}
            notes={subNotes}
            search={search}
          />
        </Grid>
      </CardContent>
    </Card>
  );
};

type Props = {
  search: string;
  depth?: number;
} & (
  | { note: NewNote; onNewNoteCancel: () => void }
  | { note: NoteWithTags; onNewNoteCancel?: never }
);

const Note = ({ note, depth, search, onNewNoteCancel }: Props) => {
  const [edit, setEdit] = React.useState(!('id' in note)); // If note has no 'id', it must be a NewNote
  const [creatingSubNote, setCreatingSubNote] = React.useState(false);
  const [confirmCancelEditOpen, setConfirmCancelEditOpen] = React.useState(false);
  const [noteIsModified, setNoteIsModified] = React.useState(false);
  const theme = useTheme();
  const editorFullscreen = useMediaQuery(theme.breakpoints.down('xs'));
  const dispatch = useDispatch();
  const titles = useSelector(getLinkIds);
  const subNotes = useSelector((state: AppState) =>
    'id' in note ? getSubNotes(state, { note_id: note.id }) : {},
  );

  const cancelEdit = () => {
    setEdit(false);
    setCreatingSubNote(false);
    setConfirmCancelEditOpen(false);
    if (onNewNoteCancel) {
      onNewNoteCancel();
    }
  };

  const tryCancelEdit = () => {
    if (noteIsModified) {
      setConfirmCancelEditOpen(true);
    } else {
      cancelEdit();
    }
  };

  const save = async (noteData: (NewNote | UpdateNote) & Pick<NoteWithTags, 'tags'>) => {
    const { title, body, tags, parent_note_id: parentNoteId } = noteData;

    if (creatingSubNote || !('id' in note)) {
      await dispatch(
        createNote({
          title,
          body,
          tags,
          parent_note_id: parentNoteId,
        }),
      );
    } else {
      await dispatch(
        updateNote({
          id: note.id,
          title,
          body,
          parent_note_id: parentNoteId,
          tags,
        }),
      );
    }

    setEdit(false);
    setCreatingSubNote(false);
  };

  return (
    <>
      {'id' in note ? (
        <NoteContents
          titles={titles}
          search={search}
          subNotes={subNotes}
          depth={depth}
          setEdit={setEdit}
          setCreatingSubNote={setCreatingSubNote}
          note={note}
        />
      ) : null}
      <ConfirmationDialog
        open={confirmCancelEditOpen}
        title='If you close this editor, you will lose your changes.'
        onPositive={cancelEdit}
        onNegative={() => setConfirmCancelEditOpen(false)}
      />
      <Dialog
        classes={{ root: styles.markdown }}
        open={edit || creatingSubNote}
        fullWidth
        maxWidth='lg'
        fullScreen={editorFullscreen}
        onClose={tryCancelEdit}
        data-testid='edit-note-dialog'
      >
        <Suspense
          fallback={<ReactLoading type='spin' className={styles.loadingSpinner} color='#000000' />}
        >
          {edit || creatingSubNote ? (
            <NoteEditor
              onSave={save}
              onModified={setNoteIsModified}
              note={
                'id' in note && creatingSubNote
                  ? { title: '', body: '', parent_note_id: note.id }
                  : note
              }
            />
          ) : null}
        </Suspense>
      </Dialog>
    </>
  );
};

export default Note;
