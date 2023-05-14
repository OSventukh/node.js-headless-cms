import ms from 'ms';
import { login, signup, refreshTokens, checkIsUserLoggedIn, logout, adminCheck } from '../services/auth.services.js';
import { createRoles } from '../services/roles.services.js';
import HttpError from '../utils/http-error.js';
import config from '../config/config.js';

export const authController = async (req, res, next) => {
  // Check if admin exist.
  // Frontend should be redirect to signup if admin not exist or login if exist
  try {
    const result = await adminCheck();
    res.status(200).json({
      action: result ? 'login' : 'signup',
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userIp = req.ip;

    const { user, accessToken, refreshToken } = await login(email, password, userIp);
    res
      .status(200)
      .json({
        user,
        accessToken: {
          token: accessToken,
          expirationDate: new Date(Date.now() + ms(config.accessTokenExpiresIn)),
        },
        refreshToken: {
          token: refreshToken,
          expirationDate: new Date(Date.now() + ms(config.refreshTokenExpiresIn)),
        },
      });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const signupController = async (req, res, next) => {
  try {
    await createRoles();
    const user = await signup(req.body);
    res.status(201).json({
      message: 'User successfully created',
      user,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const refreshTokenController = async (req, res, next) => {
  try {
    const authHeader = req.get('authorization');
    const userRefreshToken = authHeader?.split(' ')[1];

    if (!userRefreshToken) {
      res.status(204).json();
      return;
    }

    const { newAccessToken, newRefreshToken, user } = await refreshTokens(
      userRefreshToken,
    );

    res
      .status(200)
      .json({
        accessToken: {
          token: newAccessToken,
          expirationDate: new Date(Date.now() + ms(config.accessTokenExpiresIn)),
        },
        refreshToken: {
          token: newRefreshToken,
          expirationDate: new Date(Date.now() + ms(config.refreshTokenExpiresIn)),
        },
        user,
      });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const logoutController = async (req, res, next) => {
  try {
    const userRefreshToken = req.cookies.refreshToken;
    const userAccessToken = req.get('authorization').split(' ')[1];
    await logout(userRefreshToken, userAccessToken);
    res
      .status(200)
      .clearCookie('refreshToken')
      .json({
        message: 'You have successfully logged out',
      });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};
