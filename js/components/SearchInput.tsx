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

import { Search as SearchIcon } from '@mui/icons-material';
import { alpha, InputBase, styled } from '@mui/material';

import BindKeyboard from 'components/BindKeyboard';

const SearchDiv = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 1,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  marginRight: 1,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: 1,
    width: 'auto',
  },
}));

const SearchIconDiv = styled('div')(({ theme }) => ({
  width: theme.spacing(9),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

type Props = {
  onCancelSearch: (e: Mousetrap.ExtendedKeyboardEvent, combo?: string) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.SyntheticEvent) => void;
  value: string;
};

const SearchInput = React.forwardRef(
  ({ onCancelSearch, onSubmit, value, onChange }: Props, ref) => (
    <BindKeyboard keys='esc' callback={onCancelSearch}>
      <SearchDiv>
        <SearchIconDiv>
          <SearchIcon />
        </SearchIconDiv>
        <form onSubmit={onSubmit}>
          <InputBase
            inputRef={ref}
            placeholder='Search...'
            value={value}
            onChange={onChange}
            sx={(theme) => ({
              color: 'inherit',
              width: '100%',
              '& .MuiInputBase-input': {
                padding: 1,
                paddingLeft: 10,
                transition: theme.transitions.create('width'),
                width: '100%',
                [theme.breakpoints.up('sm')]: {
                  width: 120,
                  '&:focus': {
                    width: 200,
                  },
                },
              },
            })}
          />
        </form>
      </SearchDiv>
    </BindKeyboard>
  ),
);

export default SearchInput;
