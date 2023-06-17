import express from 'express';

import { auth, rolesAccess } from '../middlewares/auth.js';

import {
  getOptionsController,
  updateOptionController,
} from '../controllers/options.controllers.js';

import { optionValidator } from '../utils/validators.js';
import checkValidation from '../middlewares/validation.js';
import { SUPERADMIN, ADMIN } from '../utils/constants/users.js';

const router = express.Router();

router.get('/site/:optionName', getOptionsController);

router.get('/site', getOptionsController);

router.patch(
  '/site/:optionName',
  auth,
  rolesAccess([SUPERADMIN, ADMIN]),
  optionValidator(),
  checkValidation,
  updateOptionController,
);

router.patch(
  '/site/',
  auth,
  rolesAccess([SUPERADMIN, ADMIN]),
  optionValidator(),
  checkValidation,
  updateOptionController,
);

export default router;
