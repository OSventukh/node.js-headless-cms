import path from 'path';
import { createLogger, transports, format } from 'winston';

const logger = createLogger({
  level: 'warn',
  format: format.combine(format.timestamp(), format.json()),

  transports: [
    new transports.File({ filename: path.join('logs', 'error.log'), level: 'error', timestamp: true }),
    new transports.File({ filename: path.join('logs', 'info.log'), level: 'info', timestamp: true }),
    new transports.File({ filename: path.join('logs', 'combined.log'), timestamp: true }),
  ],
});

export default logger;
