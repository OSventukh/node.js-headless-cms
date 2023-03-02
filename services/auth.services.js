import { jwt } from 'jsonwebtoken';
import { User } from '../models/index.js';
import { comparePassword } from '../utils/hash.js';
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

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.TOKEN_SECRET_KEY,
    );
  } catch (error) {
    throw new HttpError(
      error.message || 'Something went wrong',
      error.statusCode || 500
    );
  }
};

export const resetPassword = async () => {};
