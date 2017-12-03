// Copyright 2017 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

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

export default module => new Proxy({ logger }, {
  get(obj, property) {
    const l = obj.logger;
    if (property in l) {
      if (typeof l[property] === 'function') {
        return (msg, ...rest) => l[property](`${module.id}: ${msg}`, ...rest);
      }
      return l[property];
    }
    return undefined;
  },
});
