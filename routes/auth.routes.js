import express from 'express';

import auth from '../middlewares/auth.js';
import { loginValidator } from '../utils/validators.js';
import checkValidation from '../middlewares/validation.js';

import {
  loginController,
  refreshTokenController,
  logoutController,
} from '../controllers/auth.controllers.js';

const router = express.Router();

router.post('/login', loginValidator(), checkValidation, loginController);

router.get('/login/refreshtoken', auth, refreshTokenController);

router.post('/logout', auth, logoutController);

export default router;
