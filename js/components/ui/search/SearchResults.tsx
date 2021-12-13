// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import stripMarkdown from 'strip-markdown';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

import Tags from 'components/note/Tags';
import { getSearchResults } from 'data/notes/selectors';
import { AppState } from 'data/store';

const BrOrText = ({ children }: any) => {
  if (
    children === '\\' ||
    (Array.isArray(children) && children.length > 0 && children[0] === '\\')
  ) {
    return null;
  }
  return children;
};

const truncate = (input: string): string =>
  input.length > 100 ? `${input.substring(0, 100)}...` : input;

interface Props {
  startEditing: (note: number | null) => void;
}

export const useSearch = (): [Record<string, string>, ReturnType<typeof useSearchParams>[1]] => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentParams: Record<string, string> = {};
  searchParams.forEach((v, k) => {
    currentParams[k] = v;
  });
  return [currentParams, setSearchParams];
};

export const useSearchResults = (query: string): ReturnType<typeof getSearchResults> =>
  useSelector<AppState, ReturnType<typeof getSearchResults>>((state) =>
    getSearchResults(state, { query }),
  );

const SearchResults = ({ startEditing }: Props) => {
  const [params, setParams] = useSearch();
  const search = params.search || '';
  const searchResults = useSearchResults(search);

  const clearSearch = React.useCallback(() => {
    delete params.search;
    setParams(params);
  }, [params, setParams]);

  const edit = React.useCallback(
    (e: React.SyntheticEvent<HTMLElement>) => {
      let t: HTMLElement = e.currentTarget;
      while (t.dataset && !('noteId' in t.dataset) && t.parentElement) {
        t = t.parentElement;
      }
      if (t.dataset && 'noteId' in t.dataset && t.dataset.noteId) {
        clearSearch();
        startEditing(parseInt(t.dataset.noteId, 10));
      }
    },
    [startEditing, clearSearch],
  );

  const createNew = React.useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();
      clearSearch();
      startEditing(null);
    },
    [startEditing, clearSearch],
  );

  return (
    <Dialog
      sx={(theme) => ({
        zIndex: theme.zIndex.appBar - 1,
        scrollbarColor: 'rgba(0,0,0,.2) rgba(0,0,0,0)',
        scrollbarWidth: 'thin',
      })}
      open={search !== ''}
      scroll='paper'
      disableAutoFocus
      disableEnforceFocus
      disableRestoreFocus
      PaperProps={{
        sx: (theme) => ({
          position: 'absolute',
          top: theme.spacing(5),
          maxHeight: `calc(100% - ${theme.spacing(12)})`,
        }),
      }}
      BackdropProps={{
        invisible: true,
      }}
    >
      <DialogTitle>Results for &quot;{search}&quot;</DialogTitle>
      <DialogContent sx={{ paddingLeft: 0, paddingRight: 0 }}>
        <List>
          <ListItemButton onClick={createNew}>
            <ListItemIcon>
              <AddIcon />
            </ListItemIcon>
            <ListItemText primary={`Add ${search}`} />
          </ListItemButton>
          {searchResults.map((result) => (
            <ListItemButton key={result.item.id} onClick={edit} data-note-id={result.item.id}>
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
              <ListItemText
                primary={
                  <>
                    {result.item.title}
                    <Tags inline tags={result.item.tags} />
                  </>
                }
                secondary={
                  <ReactMarkdown
                    unwrapDisallowed
                    remarkPlugins={[remarkDirective, remarkGfm, stripMarkdown]}
                    allowedElements={['p']}
                    components={{ p: BrOrText }}
                  >
                    {truncate(result.item.body)}
                  </ReactMarkdown>
                }
              />
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default SearchResults;
