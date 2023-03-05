import express from 'express';
import { loginController, refreshTokenController, logoutController } from '../controllers/auth.controllers.js';

const router = express.Router();

router.post('/login', loginController);

router.get('/login/refreshtoken', refreshTokenController);

router.post('/logout', logoutController);

export default router;
