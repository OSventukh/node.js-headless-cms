import express from 'express';

import auth from '../middlewares/auth.js';
import { loginValidator, signupValidator } from '../utils/validators.js';
import checkValidation from '../middlewares/validation.js';

import {
  loginController,
  signupController,
  refreshTokenController,
  logoutController,
  authController,
} from '../controllers/auth.controllers.js';

const router = express.Router();

router.get('/auth', authController);

router.post('/login', loginValidator(), checkValidation, loginController);

router.post('/signup', signupValidator(), checkValidation, signupController);

router.get('/login/refreshtoken', refreshTokenController);

router.post('/logout', auth, logoutController);

export default router;
