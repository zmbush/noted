// Copyright 2017 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

// @flow

import React from 'react';

type Props = {
  routeParams: {
    errorType: string,
  },
};

export default ({ routeParams: { errorType } }: Props) => {
  if (errorType === 'server') {
    return (
      <div>
        Server Error: { JSON.stringify(window.error) }
      </div>
    );
  }
  return <div>Error: { errorType }</div>;
};
