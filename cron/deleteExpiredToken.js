import { CronJob } from 'cron';
import { Op } from 'sequelize';

import { UserToken, UserBlockedToken } from '../models/index.js';
// This cron runs every day at midnight
const deleteExpiredTokenCron = new CronJob('00 00 00 * * *', () => {
  Promise.all([
    UserToken.destroy({
      where: {
        expiresIn: {
          [Op.lte]: new Date(),
        },
      },
    }),
    UserBlockedToken.destroy({
      where: {
        expiresIn: {
          [Op.lte]: new Date(),
        },
      },
    }),
  ]);
});

export default deleteExpiredTokenCron;
