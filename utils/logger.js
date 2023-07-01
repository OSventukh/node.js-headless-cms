import { createLogger, transports, format } from 'winston';

const logger = createLogger({
  level: 'debug',
  format: format.json(),
  transports: [
    new transports.File({
      level: 'error',
      filename: 'logs/error.log',
    }),
  ],
});

export default logger;
