import express from 'express';
import { loginController } from '../controllers/auth.controllers';

const router = express.Router();

router.get('/login', loginController);

export default router;
