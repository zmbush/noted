// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import * as React from 'react';
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
  Divider,
  Grid,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
} from '@mui/material';

import MarkdownViewer from 'features/markdown/Viewer';
import NoteLoading from 'features/note_loading/NoteLoading';

import ConfirmationDialog from 'components/ConfirmationDialog';
import { NoteWithTags } from 'data/types';

import { setEditingNote } from '../edit/slice';
import { deleteNote, updateNote } from '../list/api';
import { getLinkIds } from '../list/selectors';

import Tags from './Tags';

type Props = {
  note: NoteWithTags;
  children?: React.ReactElement | React.ReactElement[];
};

const Note = ({ note, children }: Props) => {
  const titles = useSelector(getLinkIds);
  const [moreMenuEl, setMoreMenuEl] = React.useState<HTMLElement | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
  const dispatch = useDispatch();

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
    const { id } = note;
    dispatch(setEditingNote({ id }));
  };

  const startSubNoteCreate = () => {
    const { id } = note;
    dispatch(setEditingNote({ id: 'new', parent_note_id: id }));
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
            backgroundColor: 'white',
            color: 'black',
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
          '.MuiCardHeader-content': {
            overflow: 'hidden',
          },
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
        titleTypographyProps={{
          variant: 'h1',
        }}
        action={
          <>
            <IconButton
              onClick={startSubNoteCreate}
              sx={(theme) => ({
                displayPrint: 'none',
                [theme.breakpoints.down('sm')]: {
                  display: 'none',
                },
              })}
              aria-label='Add SubNote'
              size='large'
            >
              <LibraryAddIcon />
            </IconButton>
            <IconButton
              onClick={startEdit}
              sx={(theme) => ({
                displayPrint: 'none',
                [theme.breakpoints.down('sm')]: {
                  display: 'none',
                },
              })}
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
        <MenuItem
          onClick={startSubNoteCreate}
          sx={(theme) => ({
            [theme.breakpoints.up('sm')]: {
              display: 'none',
            },
          })}
        >
          <ListItemIcon>
            <LibraryAddIcon />
          </ListItemIcon>
          Create SubNote
        </MenuItem>
        <MenuItem
          onClick={startEdit}
          sx={(theme) => ({
            [theme.breakpoints.up('sm')]: {
              display: 'none',
            },
          })}
        >
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          Edit Note
        </MenuItem>
        <Divider
          sx={(theme) => ({
            [theme.breakpoints.up('sm')]: {
              display: 'none',
            },
          })}
        />
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
      <NoteLoading id={note.id} />
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
        <MarkdownViewer titles={titles}>{note.body}</MarkdownViewer>
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

export default Note;
