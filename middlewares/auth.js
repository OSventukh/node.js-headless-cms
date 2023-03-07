import jwt from 'jsonwebtoken';
import HttpError from '../utils/http-error.js';
import { UserBlockedToken } from '../models/index.js';

export default async (req, res, next) => {
  try {
    const authHeader = req.get('authorization');
    const token = authHeader?.split(' ')[1];
    // Check if the accessToken provided by the user is not already blocked.
    if (!token) {
      throw new HttpError('Not Authenticated', 401);
    }

    const blockedToken = await UserBlockedToken.findOne({
      where: {
        token,
      },
    });
    console.log('token', authHeader)
    if (blockedToken) {
      throw new HttpError('Not Authenticated', 401);
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
    req.auth = decoded;
    return next();
  } catch (error) {
    return next(new HttpError('Not Authenticated', 401));
  }
};
