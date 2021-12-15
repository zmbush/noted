// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import * as React from 'react';

import { Autocomplete, TextField } from '@mui/material';

import Tag from './Tag';

interface Props {
  options: string[];
  onChange: (tags: string[]) => void;
  value: string[];
}

const ChipInput = ({ options, value, onChange }: Props) => (
  <div>
    <Autocomplete
      freeSolo
      multiple
      options={options}
      value={value}
      onChange={(_, values) => onChange(values)}
      renderTags={(tags, getTagProps) =>
        tags.map((option, index) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <Tag label={option} {...getTagProps({ index })} />
        ))
      }
      renderInput={(params) => (
        <TextField
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...params}
          label='Tags Input'
          InputProps={{ ...params.InputProps, type: 'search' }}
        />
      )}
    />
  </div>
);

export default ChipInput;
