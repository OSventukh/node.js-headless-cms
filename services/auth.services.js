import ms from 'ms';
import {
  sequelize,
  User,
  Role,
  UserToken,
  UserBlockedToken,
  Option,
} from '../models/index.js';

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/token.js';
import HttpError from '../utils/http-error.js';
import config from '../config/config.js';
import { ACTIVE, PENDING } from '../utils/constants/status.js';

export const adminCheck = async () => {
  try {
    const adminEmail = await Option.findOne({
      where: {
        name: 'admin_email',
      },
    });

    if (!adminEmail) {
      return false;
    }

    const user = await User.findOne({
      where: {
        email: adminEmail.value,
      },
    });
    return !!user;
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};

export const login = async (email, password, userIp) => {
  try {
    const user = await User.findOne({
      where: {
        email,
      },
      include: ['role', 'topics', 'tokens'],
    });
    console.log(['user'], password)
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
    const adminEmail = await Option.findOne({
      where: {
        name: 'admin_email',
      },
    });

    if (adminEmail) {
      throw new HttpError('Administrator already exist', 409);
    }
    const adminRole = await Role.findOne({
      where: {
        name: 'Super Administrator',
      },
    });

    if (!adminRole) {
      throw new HttpError('Role not found', 500);
    }

    // Creating user and adding role 'administrator';
    const user = await sequelize.transaction(async (transaction) => {
      const createdUser = await User.create(
        { ...data, status: ACTIVE },
        { transaction },
      );
      await Promise.all([
        await Option.create({
          name: 'admin_email',
          value: data.email,
        }, { transaction }),
        await createdUser.setRole(adminRole, { transaction }),
      ]);
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
    return { newAccessToken, newRefreshToken, user: user.getPublicData() };
  } catch (error) {
    throw new HttpError('Not Authenticated', 401);
  }
};

export const checkIsUserLoggedIn = async (accessToken) => {
  try {
    verifyRefreshToken(accessToken);
    return true;
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
      expiresIn: new Date(Date.now() + ms(config.accessTokenExpiresIn)),
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

export const getPendingUser = async (confirmationToken) => {
  try {
    const user = await User.findOne({
      where: {
        confirmationToken,
      },
    });

    if (!user) {
      throw new HttpError('User not found', 404);
    }

    if (user.status !== PENDING) {
      throw new HttpError('The user is already verified', 409);
    }

    if (new Date(user.confirmationTokenExpirationDate) < new Date()) {
      throw new HttpError('Confirmation token is expired', 401);
    }

    return { email: user.email, name: user.firstname };
  } catch (error) {
    throw new HttpError(error.message, error.statusCode);
  }
};

export const confirmUser = async (confirmationToken, password) => {
  try {
    const user = await User.findOne({
      where: {
        confirmationToken,
      },
    });

    if (!user) {
      throw new HttpError('User not found', 404);
    }

    if (user.status !== PENDING) {
      throw new HttpError('The user is already verified', 409);
    }

    if (new Date(user.confirmationTokenExpirationDate) < new Date()) {
      throw new HttpError('Confirmation token is expired', 401);
    }
    user.status = ACTIVE;
    user.password = password;
    user.confirmationToken = null;
    user.confirmationTokenExpirationDate = null;

    await user.save();
  } catch (error) {
    throw new HttpError(error.message, error.statusCode);
  }
};
