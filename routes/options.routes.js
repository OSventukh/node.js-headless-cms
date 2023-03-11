import express from 'express';

import auth from '../middlewares/auth.js';

import {
  getOptionsController,
  updateOptionController,
} from '../controllers/options.controllers.js';

import { optionValidator } from '../utils/validators.js';
import checkValidation from '../middlewares/validation.js';

const router = express.Router();

router.get('/site/:optionName', getOptionsController);

router.get('/site', getOptionsController);

router.patch('/site/:optionName', auth, optionValidator(), checkValidation, updateOptionController);

router.patch('/site/', auth, optionValidator(), checkValidation, updateOptionController);

export default router;
