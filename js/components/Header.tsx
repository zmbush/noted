// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import debounce from 'debounce-promise';
import Mousetrap from 'mousetrap';

import * as React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';

import { AccountCircle, Home as HomeIcon, Menu as MenuIcon } from '@mui/icons-material';
import { AppBar, Toolbar, Typography, IconButton, styled, Menu, MenuItem } from '@mui/material';

import BindKeyboard from 'components/BindKeyboard';
import SearchInput from 'components/SearchInput';

const FillSpace = styled('div')({ flexGrow: 1 });

type Props = {
  createNewShortcut: (
    e: Mousetrap.ExtendedKeyboardEvent | React.SyntheticEvent,
    combo?: string,
  ) => void;
  setSearch: (newSearch: string) => void;
  onStartEdit: (e: React.SyntheticEvent) => void;
  onSignOut: (e: React.SyntheticEvent) => void;
  debounceInterval?: number;
};

const Header = ({
  createNewShortcut,
  setSearch,
  onStartEdit,
  onSignOut,
  debounceInterval = 100,
}: Props) => {
  const [searchInputValue, setSearchInputValue] = React.useState('');
  const [userMenuEl, setUserMenuEl] = React.useState<HTMLElement>(null);
  const isUserMenuOpen = Boolean(userMenuEl);
  const navigate = useNavigate();
  const [debouncedSearch, _] = React.useState<(v: string) => Promise<string>>(() =>
    debounce(async (v) => v, debounceInterval),
  );

  const doSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInputValue(e.target.value);
    setSearch(await debouncedSearch(e.target.value));
  };

  const cancelSearch = (e: Mousetrap.ExtendedKeyboardEvent, _combo?: string) => {
    e.preventDefault();
    setSearchInputValue('');
    setSearch('');
  };

  const closeUserMenu = () => {
    setUserMenuEl(null);
  };

  const openUserMenu = (e: React.MouseEvent<HTMLElement>) => {
    setUserMenuEl(e.currentTarget);
  };

  const signOut = (e: React.SyntheticEvent) => {
    setUserMenuEl(null);
    onSignOut(e);
  };

  return (
    <>
      <AppBar sx={{ displayPrint: 'none' }}>
        <Toolbar>
          <Routes>
            <Route
              path='/'
              element={
                <IconButton
                  aria-label='Menu'
                  color='inherit'
                  size='large'
                  sx={{
                    marginLeft: '-12px',
                    marginRight: '20px',
                  }}
                >
                  <MenuIcon />
                </IconButton>
              }
            />
            <Route
              path='/*'
              element={
                <IconButton
                  aria-label='Menu'
                  color='inherit'
                  onClick={() => {
                    navigate('/');
                  }}
                  size='large'
                  sx={{
                    marginLeft: '-12px',
                    marginRight: '20px',
                  }}
                >
                  <HomeIcon />
                </IconButton>
              }
            />
          </Routes>
          <Typography
            variant='h6'
            color='inherit'
            noWrap
            sx={(theme) => ({
              display: 'none',
              [theme.breakpoints.up('sm')]: {
                display: 'block',
              },
            })}
          >
            Noted
          </Typography>
          <FillSpace />
          <BindKeyboard keys='ctrl+o' callback={createNewShortcut}>
            <SearchInput
              onCancelSearch={cancelSearch}
              value={searchInputValue}
              onChange={doSearch}
              onSubmit={onStartEdit}
            />
          </BindKeyboard>
          <IconButton aria-haspopup='true' onClick={openUserMenu} color='inherit' size='large'>
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Menu
        anchorEl={userMenuEl}
        open={isUserMenuOpen}
        onClose={closeUserMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MenuItem onClick={signOut}>
          <p>Sign Out</p>
        </MenuItem>
      </Menu>
    </>
  );
};

export default Header;
