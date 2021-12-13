// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
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

import DebouncedSearch from 'features/search/DebouncedSearch';
import { signOutUser } from 'features/user/api';

import BindKeyboard from 'components/BindKeyboard';

const FillSpace = styled('div')({ flexGrow: 1 });

type Props = {
  createNewShortcut: (
    e: Mousetrap.ExtendedKeyboardEvent | React.SyntheticEvent,
    combo?: string,
  ) => void;
  onStartEdit: (e: React.SyntheticEvent) => void;
  debounceInterval?: number;
};

const Header = ({ createNewShortcut, onStartEdit, debounceInterval = 50 }: Props) => {
  const [userMenuEl, setUserMenuEl] = React.useState<HTMLElement | null>(null);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [mainMenuOpen, setMainMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
    dispatch(signOutUser());
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
            <DebouncedSearch debounceInterval={debounceInterval} onStartEdit={onStartEdit} />
          </BindKeyboard>
          <IconButton aria-haspopup='true' onClick={openUserMenu} color='inherit' size='large'>
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
