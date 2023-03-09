import express from 'express';

import auth from '../middlewares/auth.js';

import {
  getOptionsController,
  updateOptionController,
} from '../controllers/options.controllers.js';

const router = express.Router();

router.get('/site/:optionName', getOptionsController);

router.get('/site', getOptionsController);

router.patch('/site/:optionName', auth, updateOptionController);

router.patch('/site/', auth, updateOptionController);

export default router;
