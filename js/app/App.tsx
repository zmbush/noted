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

import { Grid, styled } from '@mui/material';

import ErrorManager from 'features/error_tracking/ErrorManager';
import NoteEditor from 'features/notes/edit/NoteEditor';
import { setEditingNote } from 'features/notes/edit/slice';
import { AppState } from 'features/redux/store';
import { useIsLoading } from 'features/request_tracking';
import SearchResults, { useSearch, useSearchResults } from 'features/search/SearchResults';
import LogIn from 'features/user/LogIn';
import { prefix as userPrefix } from 'features/user/api';

import Loading from 'components/Loading';

import Pages from './Pages';
import Header from './header/Header';

const AppRoot = styled('div')({
  width: '100%',
  '@media print': {
    overflow: 'visible !important',
    columnCount: 2,
    columnWidth: '200px',
  },
});

const App = () => {
  const isSignedIn = useSelector<AppState>((state) => state.user.isSignedIn);
  const isLoading = useIsLoading(userPrefix);
  const dispatch = useDispatch();
  const [params, _setParams] = useSearch();
  const searchResults = useSearchResults(params.search || '');
  React.useEffect(() => {
    document.title = `Noted`;
  }, []);

  const startEdit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (searchResults.length > 0 && searchResults[0].item.title === params.search) {
      dispatch(setEditingNote({ id: searchResults[0].item.id }));
    } else {
      dispatch(setEditingNote({ id: 'new', title: params.search }));
    }
  };

  const startEditing = React.useCallback(
    (note: number | null) => {
      if (note) {
        dispatch(setEditingNote({ id: note }));
      } else {
        dispatch(setEditingNote({ id: 'new', title: params.search }));
      }
    },
    [dispatch, params],
  );

  const createNewShortcut = (e: { preventDefault: () => void }, _combo?: string) => {
    e.preventDefault();
    dispatch(setEditingNote({ id: 'new', title: params.search }));
  };

  return (
    <AppRoot>
      {isSignedIn ? <Header createNewShortcut={createNewShortcut} onStartEdit={startEdit} /> : null}
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <LogIn open={!isSignedIn} />
          <Grid
            container
            component='article'
            spacing={1}
            sx={{
              '@media print': {
                marginTop: 0,
                display: 'block',
              },
              marginTop: '75px',
            }}
          >
            <Pages />
          </Grid>
          <NoteEditor />
          <SearchResults startEditing={startEditing} />
        </>
      )}
      <ErrorManager />
    </AppRoot>
  );
};

export default App;
