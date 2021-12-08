// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//

/* eslint-disable no-param-reassign */
import * as React from 'react';

type Props = {
  initialValue: string;
  events?: {
    change?: () => void;
  };
};

export const Editor = React.forwardRef(
  ({ initialValue, events }: Props, ref: React.MutableRefObject<any>) => {
    const [markdown, setMarkdown] = React.useState(initialValue);
    return (
      <input
        value={markdown}
        onChange={async (e) => {
          setMarkdown(e.target.value);
          ref.current = {
            getInstance() {
              return { getMarkdown: () => e.target.value };
            },
          };
          if (events && events.change) {
            events.change();
          }
        }}
      />
    );
  },
);

export default Editor;
