import ms from 'ms';
import { sequelize, User, Role, UserToken, UserBlockedToken } from '../models/index.js';

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/token.js';
import HttpError from '../utils/http-error.js';
import config from '../config/config.js';

export const adminCheck = async () => {
  const users = await User.findAll({ include: 'role' });
  return users.length > 0 && users[0].role.name === 'Administrator';
};

export const login = async (email, password, userIp) => {
  try {
    const user = await User.findOne({
      where: {
        email,
      },
      include: ['role', 'topics', 'tokens'],
    });

    if (!user) {
      throw new HttpError('Invalid email or password', 403);
    }
    const isMatchPassword = await user.comparePassword(password);

    if (!isMatchPassword) {
      throw new HttpError('Invalid email or password', 403);
    }

    const accessToken = generateAccessToken(user.getTokenData());
    const refreshToken = generateRefreshToken({ id: user.id });
    // A user should have no more than 5 tokens
    if (user.tokens && user.tokens.length === 5) {
      const sortedTokens = user.tokens.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );
      await sortedTokens[0].destroy();
    }
    await UserToken.create({
      userId: user.id,
      token: refreshToken,
      ip: userIp,
      expiresIn: new Date(Date.now() + ms(config.refreshTokenExpiresIn)),
    });

    return {
      user: user.getPublicData(),
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};

export const signup = async (data) => {
  try {
    const users = await User.findAll();
    if (users.length > 0) {
      throw new HttpError('Administrator already exist', 409);
    }
    const adminRole = await Role.findOne({
      where: {
        name: 'Administrator',
      },
    });

    if (!adminRole) {
      throw new HttpError('Role not found', 500);
    }

    // Creating user and adding role 'administrator';
    const user = await sequelize.transaction(async (transaction) => {
      const createdUser = await User.create(data, { transaction });
      await createdUser.setRole(adminRole, { transaction });
      return createdUser;
    });
    return user;
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      throw new HttpError(error.message, 400);
    }
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};

export const refreshTokens = async (oldRefreshToken) => {
  try {
    const { id } = verifyRefreshToken(oldRefreshToken);

    const userToken = await UserToken.findOne({
      where: {
        token: oldRefreshToken,
      },
    });
    const user = await User.findByPk(id, {
      include: ['role', 'topics'],
    });
    if (!userToken || !user) {
      throw new HttpError('Not Authenticated', 401);
    }
    const newRefreshToken = generateRefreshToken({ id: user.id });
    const newAccessToken = generateAccessToken(user.getTokenData());

    await userToken.destroy();
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

export const checkIsUserLoggedIn = async (refreshToken) => {
  try {
    verifyRefreshToken(refreshToken);
    const savedToken = await UserToken.findOne({
      where: {
        token: refreshToken,
      },
    });
    return !!savedToken;
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
