import jwt from 'jsonwebtoken';
import HttpError from '../utils/http-error.js';
import { UserBlockedToken } from '../models/index.js';

export async function auth(req, res, next) {
  try {
    const authHeader = req.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      throw new HttpError('Not Authenticated', 401);
    }

    // Check if the accessToken provided by the user is not already blocked.
    const blockedToken = await UserBlockedToken.findOne({
      where: {
        token,
      },
    });

    if (blockedToken) {
      throw new HttpError('Not Authenticated', 401);
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
    req.auth = decoded;
    return next();
  } catch (error) {
    return next(new HttpError('Not Authenticated', 401));
  }
}

export function rolesAccess(roles = []) {
  return (req, res, next) => {
    const allowedRoles = roles.map((role) => role?.toLowerCase());
    const authUserRole = req?.auth?.role.toLowerCase();
    if (allowedRoles.includes(authUserRole)) {
      return next();
    }
    return next(new HttpError('Not Authorized', 401));
  };
}
