// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import * as React from 'react';
import Spinner from 'react-loader-spinner';

import { Box, Fade, SxProps, Theme, useTheme } from '@mui/material';

const Loading = ({
  sx,
  in: isIn = true,
  timeout = 200,
}: {
  sx?: SxProps<Theme>;
  in?: boolean;
  timeout?: number;
}) => {
  const theme = useTheme();
  return (
    <Fade in={isIn} timeout={timeout}>
      <Box
        sx={
          sx || {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }
        }
      >
        <Spinner
          type='TailSpin'
          color={theme.palette.primary.main}
          secondaryColor={theme.palette.secondary.main}
        />
      </Box>
    </Fade>
  );
};

export default Loading;
