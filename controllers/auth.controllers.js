import ms from 'ms';
import { login, signup, refreshTokens, isUserLoggedIn, logout, adminCheck } from '../services/auth.services.js';
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
  const { email, password } = req.body;
  const userRefreshToken = req.cookies?.refreshToken;
  try {
    // Check if user already logged in;
    if (isUserLoggedIn(userRefreshToken)) {
      throw new HttpError('User already authenticated', 409);
    }

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

export const logoutController = async (req, res, next) => {
  try {
    const userRefreshToken = req.cookies?.refreshToken;
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
