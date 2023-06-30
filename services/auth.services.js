import ms from 'ms';
import {
  sequelize,
  User,
  Role,
  UserToken,
  UserBlockedToken,
  Option,
} from '../models/index.js';
import sendMail from '../utils/nodemailer.js';
import { resetPasswordEmail } from '../utils/emails/email-list.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../utils/token.js';
import HttpError from '../utils/http-error.js';
import config from '../config/config.js';
import { ACTIVE, SUPERADMIN, PENDING } from '../utils/constants/users.js';
import generateConfirmationToken from '../utils/confirmation-token.js';

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
    throw new HttpError(
      error.message || 'Something went wrong',
      error.statusCode || 500
    );
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

    if (!user) {
      throw new HttpError('Invalid email or password', 403);
    }

    if (user.status === PENDING) {
      throw new HttpError(
        'Your account has not been verified yet. Please check your email and follow the confirmation link.',
        401
      );
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
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
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
    throw new HttpError(
      error.message || 'Something went wrong',
      error.statusCode || 500
    );
  }
};

export const signup = async (data) => {
  try {
    const superAdmin = await User.findOne({
      where: {
        '$Role.name$': SUPERADMIN,
      },
      include: ['role'],
    });

    if (superAdmin) {
      throw new HttpError('Administrator already exist', 409);
    }

    const adminRole = await Role.findOne({
      where: {
        name: SUPERADMIN,
      },
    });

    if (!adminRole) {
      throw new HttpError('Role not found', 500);
    }

    // Creating user and adding role 'administrator';
    const user = await sequelize.transaction(async (transaction) => {
      const createdUser = await User.create(
        {
          ...data,
          status: ACTIVE,
          confirmationToken: null,
          confirmationTokenExpirationDate: null,
        },
        { transaction }
      );
      await Promise.all([
        Option.create(
          {
            name: 'admin_email',
            value: data.email,
          },
          { transaction }
        ),
        createdUser.setRole(adminRole, { transaction }),
      ]);
      return createdUser;
    });
    return user;
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      throw new HttpError(error.message, 400);
    }
    throw new HttpError(
      error.message || 'Something went wrong',
      error.statusCode || 500
    );
  }
};

export const refreshTokens = async (oldRefreshToken, userIp) => {
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

    await Promise.all([
      UserToken.create({
        ip: userIp,
        userId: user.id,
        token: newRefreshToken,
        expiresIn: new Date(Date.now() + ms(config.refreshTokenExpiresIn)),
      }),
      userToken.destroy(),
    ]);

    return { newAccessToken, newRefreshToken };
  } catch (error) {
    throw new HttpError('Not Authenticated', 401);
  }
};

export const isUserLoggedIn = (accessToken) => {
  try {
    verifyAccessToken(accessToken);
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

export const resetPassword = async (email, host) => {
  try {
    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      throw new HttpError('User with this email not exist', 400);
    }

    const confirmationToken = await generateConfirmationToken();

    user.confirmationToken = confirmationToken;
    user.confirmationTokenExpirationDate = new Date(Date.now() + ms('1 day'));

    await user.save();
    await sendMail(
      resetPasswordEmail({
        host,
        token: confirmationToken,
        userEmail: user.email,
        userName: user.firstname,
      }),
    );
  } catch (error) {
    throw new HttpError(error.message, error.statusCode);
  }
};
