// Copyright 2017 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

// @flow

import type $Subtype from 'flow';
import type { $Request, $Response, NextFunction } from 'express';

export const asyncHandler = (fn: ($Subtype<$Request>, $Response, NextFunction) => Promise<*>) => (
  (req: $Subtype<$Request>, res: $Response, next: NextFunction) => {
    fn(req, res, next).catch((e) => {
      throw e;
    });
  }
);

export const SHIT = 'shit';
