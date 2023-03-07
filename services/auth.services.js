import ms from 'ms';
import { User, UserToken, UserBlockedToken } from '../models/index.js';
import { comparePassword } from '../utils/hash.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/token.js';
import HttpError from '../utils/http-error.js';
import config from '../config/config.js';

export const login = async (email, password) => {
  try {
    const user = await User.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      throw new HttpError('Invalid email or password', 403);
    }

    const isMatchPassword = await comparePassword(password, user.password);

    if (!isMatchPassword) {
      throw new HttpError('Invalid email or password', 403);
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await UserToken.create({
      user: user.id,
      token: refreshToken,
      expiresIn: new Date(Date.now() + ms(config.refreshTokenExpiresIn)),
    });

    return {
      userId: user.id,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new HttpError(
      error.message || 'Something went wrong',
      error.statusCode || 500,
    );
  }
};

export const refreshTokens = async (oldRefreshToken) => {
  try {
    const { userId } = verifyRefreshToken(oldRefreshToken);
    const userToken = await UserToken.findOne({
      where: {
        token: oldRefreshToken,
      },
    });
    const user = await User.findByPk(userId);
    if (!userToken || !user) {
      throw new HttpError('Not Authenticated', 401);
    }

    const newRefreshToken = generateRefreshToken(user);
    const newAccessToken = generateAccessToken(user);

    await UserToken.destroy({ where: { id: userToken.id } });
    await UserToken.create({
      user: user.id,
      token: newRefreshToken,
      expiresIn: new Date(Date.now() + ms(config.refreshTokenExpiresIn)),
    });
    return { newAccessToken, newRefreshToken };
  } catch (error) {
    throw new HttpError('Not Authenticated', 401);
  }
};

export const isUserLoggedIn = (refreshToken) => {
  try {
    verifyRefreshToken(refreshToken);
    const savedToken = UserToken.findOne({
      where: {
        token: refreshToken,
      },
    });
    return savedToken && true;
  } catch (error) {
    return false;
  }
};

export const logout = async (refreshToken, accessToken) => {
  try {
    // Block the access token for users who still have a valid token, preventing them from accessing
    // the system even if they still have a valid access token.
    await UserBlockedToken.create({
      token: accessToken,
    });
    // Delete refreshToken of the user that logging out from database
    await UserToken.destroy({
      where: {
        token: refreshToken,
      },
    });
  } catch (error) {
    throw new HttpError(error.message, error.statusCode);
  }
};
