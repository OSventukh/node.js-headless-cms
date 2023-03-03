import { User, UserToken } from '../models/index.js';
import { comparePassword } from '../utils/hash.js';
import { generateAccessToken, generateRefreshToken } from '../utils/token.js';
import HttpError from '../utils/http-error.js';

export const login = async (email, password) => {
  try {
    const user = await User.findOne({
      where: {
        email,
      },
    });
    console.log(user)
    if (!user) {
      throw new HttpError('Invalid email or password', 401);
    }

    const isMatchPassword = await comparePassword(password, user.password);
    if (!isMatchPassword) {
      throw new HttpError('Invalid email or password', 401);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await UserToken.create({
      user: user.id,
      token: refreshToken,
      expiresIn: Date.now(),
    });

    return {
      userId: user.id,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};

export const logout = async () => {};
