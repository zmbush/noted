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
import { connect } from 'react-redux';

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

import api from 'api';
import AutoLink from 'components/AutoLink';
import ConfirmationDialog from 'components/ConfirmationDialog';
import * as styles from 'components/Note.tsx.scss';
import NoteList from 'components/NoteList';
import Tags from 'components/Tags';
import { NewNote, UpdateNote, NoteWithTags } from 'data/api_types';
import { AppState } from 'data/reducers';
import { getLinkIds, getSubNotes } from 'data/selectors';

const NoteEditor = React.lazy(
  () => import(/* webpackChunkName: "editor" */ 'components/NoteEditor'),
);

type NoteContentsProps = {
  note: NoteWithTags;
  titles: Map<string, Set<number>>;
  onDeleteNote: (id: number) => void;
  onUpdateNote: (note?: NoteWithTags) => void;
  setEdit: (edit: boolean) => void;
  setCreatingSubNote: (creatingSubNote: boolean) => void;
  search: string;
  subNotes: Map<number, NoteWithTags>;
  depth?: number;
};

export const NoteContents = ({
  note,
  onDeleteNote,
  onUpdateNote,
  setEdit,
  setCreatingSubNote,
  titles,
  search,
  subNotes,
  depth,
}: NoteContentsProps) => {
  const [moreMenuEl, setMoreMenuEl] = React.useState<HTMLElement>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);

  const doDelete = async () => {
    await api.note.delete(note.id);
    onDeleteNote(note.id);
  };

  const archiveNote = async () => {
    setMoreMenuEl(null);

    const { id, archived } = note;
    const result = await api.note.update(id, { archived: !archived });
    onUpdateNote(result);
  };

  const pinNote = async () => {
    setMoreMenuEl(null);

    const { id, pinned } = note;
    const result = await api.note.update(id, { pinned: !pinned });
    onUpdateNote(result);
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
            marginTop: '75px',
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
            onUpdateNote={onUpdateNote}
            onDeleteNote={onDeleteNote}
          />
        </Grid>
      </CardContent>
    </Card>
  );
};

type Props = {
  note: NewNote | NoteWithTags;
  search: string;
  titles: Map<string, Set<number>>;
  subNotes: Map<number, NoteWithTags>;
  onUpdateNote: (note?: NoteWithTags) => void;
  onDeleteNote: (id: number) => void;
  depth?: number;
};

const Note = ({ note, titles, depth, subNotes, search, onUpdateNote, onDeleteNote }: Props) => {
  const [edit, setEdit] = React.useState(!('id' in note)); // If note has no 'id', it must be a NewNote
  const [creatingSubNote, setCreatingSubNote] = React.useState(false);
  const [confirmCancelEditOpen, setConfirmCancelEditOpen] = React.useState(false);
  const noteEditor = React.useRef<any>();
  const theme = useTheme();
  const editorFullscreen = useMediaQuery(theme.breakpoints.down('xs'));

  const cancelEdit = () => {
    setEdit(false);
    setCreatingSubNote(false);
    setConfirmCancelEditOpen(false);
    onUpdateNote(null);
  };

  const tryCancelEdit = () => {
    if (!noteEditor.current || !noteEditor.current.hasChanges()) {
      cancelEdit();
    } else {
      setConfirmCancelEditOpen(true);
    }
  };

  const save = async (noteData: (NewNote | UpdateNote) & Pick<NoteWithTags, 'tags'>) => {
    const { title, body, tags, parent_note_id: parentNoteId } = noteData;
    let result;
    if (creatingSubNote || !('id' in note)) {
      result = await api.note.create({
        title,
        body,
        parent_note_id: parentNoteId,
      });
    } else {
      result = await api.note.update(note.id, {
        title,
        body,
        parent_note_id: parentNoteId,
      });
    }

    result = await api.note.setTags(result.id, tags);

    setEdit(false);
    setCreatingSubNote(false);
    onUpdateNote(result);
  };

  return (
    <>
      {'id' in note ? (
        <NoteContents
          titles={titles}
          search={search}
          subNotes={subNotes}
          depth={depth}
          onDeleteNote={onDeleteNote}
          onUpdateNote={onUpdateNote}
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
      >
        <Suspense
          fallback={<ReactLoading type='spin' className={styles.loadingSpinner} color='#000000' />}
        >
          {edit || creatingSubNote ? (
            <NoteEditor
              onSave={save}
              ref={noteEditor}
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

export const Inner = Note;

const mapStateToProps = (state: AppState, { note }: { note: NewNote | NoteWithTags }) => ({
  titles: getLinkIds(state),
  subNotes: 'id' in note ? getSubNotes(state, { note_id: note.id }) : new Map(),
});

export default connect(mapStateToProps)(Note);
