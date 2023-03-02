import express from 'express';
import { loginController } from '../controllers/auth.controllers';

const router = express.Router();

router.post('/login', loginController);

export default router;
