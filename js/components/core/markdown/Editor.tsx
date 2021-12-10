// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import type { Property } from 'csstype';
import Editor from 'rich-markdown-editor';
import {
  dark as baseDarkTheme,
  light as baseLightTheme,
} from 'rich-markdown-editor/dist/styles/theme';

import * as React from 'react';

import { useMediaQuery, Box } from '@mui/material';

import * as styles from './styles.scss';

const darkTheme: typeof baseDarkTheme = {
  ...baseDarkTheme,
  zIndex: 1500,
  background: 'none',
};

const lightTheme: typeof baseLightTheme = {
  ...baseLightTheme,
  zIndex: 1500,
};

interface Props
  extends Omit<
    React.ComponentProps<typeof Editor>,
    'defaultValue' | 'value' | 'theme' | 'readOnly' | 'extensions'
  > {
  body: string;
  height?: Property.Height;
}

const MarkdownEditor = ({ body, height, ...props }: Props) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  return (
    <Box sx={{ height, overflowY: 'scroll' }} className={styles.markdown}>
      <Editor
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        defaultValue={body}
        theme={prefersDarkMode ? darkTheme : lightTheme}
      />
    </Box>
  );
};
MarkdownEditor.defaultProps = Editor.defaultProps;

export default MarkdownEditor;
