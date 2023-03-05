import jwt from 'jsonwebtoken';
import HttpError from '../utils/http-error.js';

export default (req, res, next) => {
  if (req.path === '/login' || req.path === '/login/refreshtoken') {
    return next();
  }
  try {
    const authHeader = req.get('authorization');
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new HttpError('Not Authenticated', 401);
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
    req.auth = decoded;
    return next();
  } catch (error) {
    return next(new HttpError('Not Authenticated', 401));
  }
};
