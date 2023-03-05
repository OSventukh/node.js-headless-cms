import express from 'express';
import { loginController, refreshTokenController } from '../controllers/auth.controllers.js';

const router = express.Router();

router.post('/login', loginController);

router.get('/login/refreshtoken', refreshTokenController);

export default router;
