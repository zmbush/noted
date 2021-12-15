// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { createTheme } from '@mui/material';
import { purple, deepPurple, lightBlue } from '@mui/material/colors';

const makeColoredTheme = (mode: 'dark' | 'light') =>
  createTheme({
    palette: {
      mode,
      primary: mode === 'light' ? deepPurple : purple,
      secondary: mode === 'light' ? purple : lightBlue,
    },
    typography: {
      h1: { fontSize: '4.5em' },
      h2: { fontSize: '3em' },
      h3: { fontSize: '2.25em' },
      h4: { fontSize: '1.725em' },
      h5: { fontSize: '1.25em', fontWeight: 'bold', fontStyle: 'italic' },
    },
  });

export const lightTheme = makeColoredTheme('light');
export const darkTheme = makeColoredTheme('dark');
