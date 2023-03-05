import ms from 'ms';
import { login, refreshTokens } from '../services/auth.services.js';
import HttpError from '../utils/http-error.js';
import config from '../config/config.js';

export const loginController = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const { userId, accessToken, refreshToken } = await login(email, password);
    res
      .status(200)
      .cookie('refreshToken', refreshToken, {
        expires: new Date(Date.now() + ms(config.refreshTokenExpiresIn)),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      })
      .json({
        userId,
        accessToken,
      });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const refreshTokenController = async (req, res, next) => {
  const userRefreshToken = req.cookies.refreshToken;
  try {
    const { newAccessToken, newRefreshToken } = await refreshTokens(
      userRefreshToken,
    );

    res
      .status(200)
      .cookie('refreshToken', newRefreshToken, {
        expires: new Date(Date.now() + ms(config.refreshTokenExpiresIn)),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      })
      .json({
        accessToken: newAccessToken,
      });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const resetPasswordController = async (req, res, next) => {};

export const createAdminController = async (req, res, next) => {};
