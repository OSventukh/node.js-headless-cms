import express from 'express';

import auth from '../middlewares/auth';

import {
  loginController,
  refreshTokenController,
  logoutController,
} from '../controllers/auth.controllers.js';

const router = express.Router();

router.post('/login', loginController);

router.get('/login/refreshtoken', auth, refreshTokenController);

router.post('/logout', auth, logoutController);

export default router;
