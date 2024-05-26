import ms from 'ms';
import {
  login,
  signup,
  refreshTokens,
  getPendingUser,
  confirmUser,
  isUserLoggedIn,
  logout,
  adminCheck,
  resetPassword,
} from '../services/auth.services.js';
import { createRoles } from '../services/roles.services.js';
import HttpError from '../utils/http-error.js';
import config from '../config/config.js';
import { getAuthorizationToken } from '../utils/token.js';

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
    const authToken = getAuthorizationToken(req);
    if (isUserLoggedIn(authToken)) {
      throw new HttpError('User already authenticated', 409);
    }
    const { email, password } = req.body;
    const userIp = req.ip;

    const { user, accessToken, refreshToken } = await login(
      email,
      password,
      userIp
    );
    res.status(200).json({
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
    const userRefreshToken = getAuthorizationToken(req);

    if (!userRefreshToken) {
      res.status(204).json();
      return;
    }

    const userIp = req.ip;
    const { newAccessToken, newRefreshToken } = await refreshTokens(
      userRefreshToken,
      userIp
    );

    res.status(200).json({
      accessToken: {
        token: newAccessToken,
        expirationDate: new Date(Date.now() + ms(config.accessTokenExpiresIn)),
      },
      refreshToken: {
        token: newRefreshToken,
        expirationDate: new Date(Date.now() + ms(config.refreshTokenExpiresIn)),
      },
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
    res.status(200).clearCookie('refreshToken').json({
      message: 'You have successfully logged out',
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const getPendingUserController = async (req, res, next) => {
  try {
    const confirmationToken = req.params.token;

    if (!confirmationToken) {
      throw new HttpError('User not found', 404);
    }

    const { name, email } = await getPendingUser(confirmationToken);
    res.status(200).json({
      userName: name,
      userEmail: email,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const confirmUserController = async (req, res, next) => {
  try {
    const { password, token } = req.body;

    if (!token) {
      throw new HttpError('User not found', 404);
    }
    await confirmUser(token, password);
    res.status(200).json({
      message: 'User successfully verified',
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const resetPasswordController = async (req, res, next) => {
  try {
    const { email } = req.body;
    const host = req.get('Origin');

    await resetPassword(email, host);
    res.status(200).json({
      message: 'A confirmation link has been sent to your email address',
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};
