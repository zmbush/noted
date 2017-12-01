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
