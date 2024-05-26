/* eslint-disable import/prefer-default-export */
import {
  limiterSlowBruteByIP,
  limiterConsecutiveFailsByEmailAndIP,
  getEmailIPkey,
} from '../utils/rate-limiter.js';
import HttpError from '../utils/http-error.js';

export async function rateLimiter(req, res, next) {
  try {
    const userIP = req.ip;
    const userEmail = req.body.email;
    const emailIPKey = getEmailIPkey(userEmail, userIP);
    await Promise.all([
      limiterConsecutiveFailsByEmailAndIP.consume(emailIPKey),
      limiterSlowBruteByIP.consume(userIP),
    ]);
    return next();
  } catch (error) {
    const retryMins = Math.round(error.msBeforeNext / 1000 / 60) || 1;
    res.set('Retry-After', String(retryMins));
    return next(new HttpError(`Too many requests. Retry after ${retryMins} minutes.`, 429));
  }
}
