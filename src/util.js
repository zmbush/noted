import logger from '~/src/logger';

export const asyncHandler = fn => (req, res, next) => {
  fn(req, res, next).catch((e) => {
    throw e;
  });
};
