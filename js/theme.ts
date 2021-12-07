// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { createTheme } from '@mui/material';

const makeColoredTheme = (mode: 'dark' | 'light') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#311b92',
      },
      secondary: {
        main: '#00897b',
      },
      success: {
        main: '#43a047',
      },
      error: {
        main: '#e53935',
      },
    },
  });

export const lightTheme = makeColoredTheme('light');
export const darkTheme = makeColoredTheme('dark');
