import { login } from '../services/auth.services.js';
import HttpError from '../utils/http-error.js';

export const loginController = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const { userId, accessToken, refreshToken } = await login(email, password);
    res.status(200).json({
      userId,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const resetPasswordController = async (req, res, next) => {};

export const createAdminController = async (req, res, next) => {};
