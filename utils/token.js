import jwt from 'jsonwebtoken';

import config from '../config/config.js';

export const generateAccessToken = (user) => (
  jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    { expiresIn: config.accessTokenExpiresIn },
  )
);

export const generateRefreshToken = (user) => (
  jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
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
