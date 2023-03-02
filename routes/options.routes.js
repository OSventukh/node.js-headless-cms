import express from 'express';

import {
  getOptionsController,
  updateOptionController,
} from '../controllers/options.controllers.js';

const router = express.Router();

router.get('/site/:optionName', getOptionsController);

router.get('/site', getOptionsController);

router.patch('/site/:optionName', updateOptionController);

router.patch('/site/', updateOptionController);

export default router;
