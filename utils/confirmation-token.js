import crypto from 'crypto';
import HttpError from './http-error.js';
// eslint-disable-next-line import/no-cycle
import { User } from '../models/index.js';

export default async function generateConfirmationToken(attempts = 0) {
  const MAX_ATTEMPTS = 10;

  // to prevent infinity loop limit the number of attempts
  if (attempts > MAX_ATTEMPTS) {
    throw new HttpError('Failed to generate an unique confirmation token', 500);
  }

  const token = crypto.randomBytes(20).toString('hex');
  const userWithThisToken = await User.findOne({
    where: {
      confirmationToken: token,
    },
  });

  // if created token already exist run the function again to generate new token
  if (userWithThisToken) {
    return generateConfirmationToken(attempts + 1);
  }
  return token;
}
