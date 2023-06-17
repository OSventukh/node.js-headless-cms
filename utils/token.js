import jwt from 'jsonwebtoken';

import config from '../config/config.js';

export const generateAccessToken = (payload) => (
  jwt.sign(
    {
      ...payload,
      createdAt: Date.now(),
    },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    { expiresIn: config.accessTokenExpiresIn },
  )
);

export const generateRefreshToken = (payload) => (
  jwt.sign(
    {
      ...payload,
      createdAt: Date.now(),
    },
    process.env.REFRESH_TOKEN_SECRET_KEY,
    { expiresIn: config.refreshTokenExpiresIn },
  )
);

export const verifyAccessToken = (token) => {
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
  return decoded;
};

export const verifyRefreshToken = (token) => {
  const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET_KEY);
  return decoded;
};

export const getAuthorizationToken = (req) => {
  const authHeader = req.get('authorization');
  const token = authHeader?.split(' ')[1];
  return token;
};
