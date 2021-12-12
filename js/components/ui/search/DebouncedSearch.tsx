// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import debounce from 'debounce-promise';
import type Mousetrap from 'mousetrap';

import * as React from 'react';

import BindKeyboard from 'components/core/BindKeyboard';

import SearchInput from './SearchInput';
import { useSearch } from './SearchResults';

interface Props {
  debounceInterval?: number;
  onStartEdit: (e: React.SyntheticEvent) => void;
}

const DebouncedSearch = ({ debounceInterval, onStartEdit }: Props) => {
  const searchInput = React.useRef<HTMLInputElement>();
  const [params, setParams] = useSearch();
  const search = params.search || '';
  const [searchInputValue, setSearchInputValue] = React.useState(search);
  const [debouncedSearch, _setDebouncedSearch] = React.useState<(v: string) => void>(() =>
    debounce(async (v) => {
      if (v !== '') {
        setParams({ ...params, search: v });
      } else {
        delete params.search;
        setParams(params);
      }
    }, debounceInterval),
  );

  const doSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInputValue(e.target.value);
    debouncedSearch(e.target.value);
  };

  const cancelSearch = (e: Mousetrap.ExtendedKeyboardEvent, _combo?: string) => {
    e.preventDefault();
    setSearchInputValue('');
    delete params.search;
    setParams(params);
  };

  const startSearch = (e: Event) => {
    e.preventDefault();
    searchInput.current?.focus();
  };

  return (
    <>
      <BindKeyboard keys='/' callback={startSearch} />
      <SearchInput
        onCancelSearch={cancelSearch}
        value={searchInputValue}
        onChange={doSearch}
        onSubmit={onStartEdit}
        ref={searchInput}
      />
    </>
  );
};

export default DebouncedSearch;
