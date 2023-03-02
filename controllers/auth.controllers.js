import { login } from '../services/auth.services.js';
import HttpError from '../utils/http-error.js';

export const loginController = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    await login(email, password);
    res.status(200).json({
      message: 'Login successfull',
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const resetPasswordController = async (req, res, next) => {};

export const createAdminController = async (req, res, next) => {};
