// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

declare module '@toast-ui/react-editor' {
  type FirstArgument<T> = T extends (arg1: infer U, ...args: any[]) => any ? U : any;

  import InnerEditor from 'tui-editor';
  import * as React from 'react';

  type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

  interface Props extends Omit<FirstArgument<InnerEditor>, 'el'> {
    onChange?: () => void;
  }

  class Editor extends React.Component<Props> {
    // eslint-disable-next-line react/no-unused-class-component-methods
    editorInst: InnerEditor;

    // eslint-disable-next-line react/no-unused-class-component-methods
    getInstance(): InnerEditor;
  }
}

declare module 'tui-editor/dist/tui-editor-extColorSyntax' {}
declare module 'map.prototype.tojson' {}
