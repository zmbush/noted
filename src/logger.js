// Copyright 2017 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

// @flow

import winston from 'winston';

const logger = winston.createLogger({
  level: 'silly',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'log/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'log/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default (module: { id: string }) => ({
  log(level: string, message: string, ...rest: any[]) {
    const msg = `${module.id}: ${message}`;
    logger.log(level, msg, ...rest);
  },

  error(...rest: any[]) {
    this.log('error', ...rest);
  },

  warn(...rest: any[]) {
    this.log('warn', ...rest);
  },

  info(...rest: any[]) {
    this.log('info', ...rest);
  },

  http(...rest: any[]) {
    this.log('http', ...rest);
  },

  verbose(...rest: any[]) {
    this.log('verbose', ...rest);
  },

  debug(...rest: any[]) {
    this.log('debug', ...rest);
  },

  silly(...rest: any[]) {
    this.log('silly', ...rest);
  },
});
