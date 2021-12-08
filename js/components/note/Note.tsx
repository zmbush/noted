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

import ConfirmationDialog from 'components/core/ConfirmationDialog';
import Loading from 'components/core/Loading';
import AutoLink from 'components/note/AutoLink';
import Tags from 'components/note/Tags';
import { createNote, deleteNote, updateNote } from 'data/notes/api';
import { getLinkIds } from 'data/notes/selectors';
import { AppState } from 'data/store';
import { NewNote, UpdateNote, NoteWithTags } from 'data/types';
import { getIsNoteChanging } from 'data/ui/selectors';

import * as styles from './styles.scss';

const NoteEditor = React.lazy(
  () => import(/* webpackChunkName: "editor" */ 'components/note/NoteEditor'),
);

type NoteContentsProps = {
  note: NoteWithTags;
  titles: { [title: string]: Set<number> };
  setEdit: (edit: boolean) => void;
  setCreatingSubNote: (creatingSubNote: boolean) => void;
  children?: React.ReactElement | React.ReactElement[];
};

export const NoteContents = ({
  note,
  setEdit,
  setCreatingSubNote,
  titles,
  children,
}: NoteContentsProps) => {
  const [moreMenuEl, setMoreMenuEl] = React.useState<HTMLElement | null>(null);
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
    p: ({ children: pChildren }) => (
      <p>
        <AutoLink titles={titles}>{pChildren}</AutoLink>
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
      <CardContent
        sx={{
          paddingTop: 0,
          '@media print': {
            paddingLeft: 0,
            '&:last-child': {
              paddingBottom: 0,
            },
          },
        }}
      >
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
          {children}
        </Grid>
      </CardContent>
    </Card>
  );
};

type Props = {
  children?: React.ReactElement | React.ReactElement[];
} & (
  | { note: NewNote; onNewNoteCancel: () => void }
  | { note: NoteWithTags; onNewNoteCancel?: never }
);

const Note = ({ note, onNewNoteCancel, children }: Props) => {
  const [edit, setEdit] = React.useState(!('id' in note)); // If note has no 'id', it must be a NewNote
  const [creatingSubNote, setCreatingSubNote] = React.useState(false);
  const [confirmCancelEditOpen, setConfirmCancelEditOpen] = React.useState(false);
  const [noteIsModified, setNoteIsModified] = React.useState(false);
  const theme = useTheme();
  const editorFullscreen = useMediaQuery(theme.breakpoints.down('xs'));
  const dispatch = useDispatch();
  const titles = useSelector(getLinkIds);

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
    if (creatingSubNote || !('id' in note)) {
      await dispatch(createNote(noteData as NewNote & Pick<NoteWithTags, 'tags'>));
    } else {
      await dispatch(
        updateNote({
          id: note.id,
          ...noteData,
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
          setEdit={setEdit}
          setCreatingSubNote={setCreatingSubNote}
          note={note}
        >
          {children}
        </NoteContents>
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
