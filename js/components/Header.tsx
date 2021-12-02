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
import { useDispatch } from 'react-redux';
import { Route, Routes, useNavigate } from 'react-router-dom';

import {
  AccountCircle,
  Archive as ArchiveIcon,
  Home as HomeIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  styled,
  Menu,
  MenuItem,
  Drawer,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

import api from 'api';
import BindKeyboard from 'components/BindKeyboard';
import SearchInput from 'components/SearchInput';
import { signOut } from 'data/actions';

const FillSpace = styled('div')({ flexGrow: 1 });

type Props = {
  createNewShortcut: (
    e: Mousetrap.ExtendedKeyboardEvent | React.SyntheticEvent,
    combo?: string,
  ) => void;
  setSearch: (newSearch: string) => void;
  onStartEdit: (e: React.SyntheticEvent) => void;
  debounceInterval?: number;
};

const Header = ({ createNewShortcut, setSearch, onStartEdit, debounceInterval = 100 }: Props) => {
  const [searchInputValue, setSearchInputValue] = React.useState('');
  const [userMenuEl, setUserMenuEl] = React.useState<HTMLElement>(null);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [mainMenuOpen, setMainMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const [debouncedSearch, _] = React.useState<(v: string) => Promise<string>>(() =>
    debounce(async (v) => v, debounceInterval),
  );
  const dispatch = useDispatch();

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
    setUserMenuOpen(false);
  };

  const openUserMenu = (e: React.MouseEvent<HTMLElement>) => {
    if (e && 'currentTarget' in e) {
      setUserMenuEl(e.currentTarget);
    }
    setUserMenuOpen(true);
  };

  const triggerSignOut = async (e: React.SyntheticEvent) => {
    setUserMenuEl(null);
    setUserMenuOpen(false);
    e.preventDefault();
    await api.user.signOut();
    dispatch(signOut());
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
                  onClick={() => setMainMenuOpen(true)}
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
          <IconButton
            aria-label='User Menu'
            aria-haspopup='true'
            onClick={openUserMenu}
            color='inherit'
            size='large'
          >
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Menu
        anchorEl={userMenuEl}
        open={userMenuOpen}
        onClose={closeUserMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MenuItem aria-label='Sign Out' onClick={triggerSignOut}>
          <p>Sign Out</p>
        </MenuItem>
      </Menu>
      <Drawer anchor='left' open={mainMenuOpen} onClose={() => setMainMenuOpen(false)}>
        <Box
          sx={{ width: 250 }}
          role='presentation'
          onClick={() => setMainMenuOpen(false)}
          onKeyDown={() => setMainMenuOpen(false)}
        >
          <List>
            <ListItem button onClick={() => navigate('/archive')}>
              <ListItemIcon>
                <ArchiveIcon />
              </ListItemIcon>
              <ListItemText primary='Archive' />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;
