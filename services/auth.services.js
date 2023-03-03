import { User } from '../models/index.js';
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
    if (!user) {
      throw new HttpError('Invalid email or password', 401);
    }

    const isMatchPassword = await comparePassword(password, user.password);

    if (!isMatchPassword) {
      throw new HttpError('Invalid email or password', 401);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return {
      id: user.id,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};

export const logout = async () => {
  
}
