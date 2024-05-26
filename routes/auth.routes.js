import express from 'express';

import { auth } from '../middlewares/auth.js';
import { rateLimiter } from '../middlewares/rate-limiter.js';
import { confirmUserValidator, resetPasswordValidator, loginValidator, signupValidator } from '../utils/validators.js';
import checkValidation from '../middlewares/validation.js';

import {
  loginController,
  signupController,
  refreshTokenController,
  logoutController,
  authController,
  getPendingUserController,
  confirmUserController,
  resetPasswordController,
} from '../controllers/auth.controllers.js';

const router = express.Router();

router.get('/auth', authController);

router.post('/login', loginValidator(), checkValidation, rateLimiter, loginController);

router.post('/signup', signupValidator(), checkValidation, signupController);

router.get('/login/refreshtoken', refreshTokenController);

router.post('/logout', auth, logoutController);

router.get('/confirm/:token', getPendingUserController);

router.post('/confirm', confirmUserValidator(), checkValidation, confirmUserController);

router.post('/reset-password', resetPasswordValidator(), checkValidation, resetPasswordController);

export default router;
