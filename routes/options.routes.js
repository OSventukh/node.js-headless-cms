import express from 'express';

import {
  createOptionController,
  getOptionsController,
  updateOptionController,
  deleteOptionController,
} from '../controllers/options.controllers.js';

const router = express.Router();

router.get('/:optionName', getOptionsController);

router.get('/', getOptionsController);

router.post('/', createOptionController);

router.patch('/:optionName', updateOptionController);

router.patch('/', updateOptionController);

router.delete('/:optionName', deleteOptionController);

router.delete('/', deleteOptionController);

export default router;
