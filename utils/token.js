import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) => (
  jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.ACCESS_TOKEN_SECRET_KEY,
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
  )
);
