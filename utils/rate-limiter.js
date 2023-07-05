import { sequelize } from '../models/index.js';
import { RateLimiterMySQL } from 'rate-limiter-flexible';
import config from '../config/config.js';
import logger from './logger.js';
const ready = (error) => {
  if (error) {
    logger.error(error.message);
  } else {
    // db and table checked/created
  }
};

export const limiterSlowBruteByIP = new RateLimiterMySQL(
  {
    storeClient: sequelize,
    keyPrefix: 'login_fail_ip_per_day',
    dbName: sequelize.config.database,
    tableName: 'limit-login-IP',
    // maximum number of failed logins allowed. 1 fail = 1 point
    // each failed login consumes a point
    points: config.maxWrongAttemptsByIPperDay,
    // delete key after 24 hours
    duration: 60 * 60 * 24,
    // number of seconds to block route if consumed points > points
    blockDuration: 60 * 60 * 24, // Block for 1 day, if 100 wrong attempts per day
  },
  ready,
);

export const limiterConsecutiveFailsByEmailAndIP = new RateLimiterMySQL(
  {
    storeClient: sequelize,
    dbName: sequelize.config.database,
    tableName: 'limit-login-Email-IP',
    keyPrefix: 'login_fail_consecutive_email_and_ip',
    points: config.maxConsecutiveFailsByEmailAndIP,
    duration: 60 * 60, // Delete key after 1 hour
    blockDuration: 60 * 60, // Block for 1 hour
  },
  ready,
);

// create key string
export const getEmailIPkey = (email, ip) => `${email}_${ip}`;
