import express from 'express';
import { getGeneralStatistics } from '../controllers/analytics.controllers.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

router.get('/statistics', auth, getGeneralStatistics);

export default router;