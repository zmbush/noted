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
