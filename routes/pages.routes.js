import express from 'express';

import { auth, rolesAccess } from '../middlewares/auth.js';
import { SUPERADMIN, ADMIN, MODER } from '../utils/constants/users.js';
import {
  createPageController,
  getPagesController,
  updatePageController,
  deletePageController,
} from '../controllers/pages.controllers.js';

import {
  pageValidator,
  idValidator,
  paginationValidator,
} from '../utils/validators.js';
import checkValidation from '../middlewares/validation.js';

const router = express.Router();

router.get(
  '/pages/:pageId',
  idValidator('pageId'),
  paginationValidator(),
  checkValidation,
  getPagesController,
);

router.get(
  '/pages',
  paginationValidator(),
  checkValidation,
  getPagesController,
);

router.post(
  '/pages',
  auth,
  rolesAccess([SUPERADMIN, ADMIN]),
  pageValidator(),
  checkValidation,
  createPageController,
);

router.patch(
  '/pages/:pageId',
  auth,
  rolesAccess([SUPERADMIN, ADMIN, MODER]),
  idValidator('pageId'),
  checkValidation,
  updatePageController,
);

router.patch(
  '/pages',
  auth,
  rolesAccess([SUPERADMIN, ADMIN, MODER]),
  pageValidator(),
  checkValidation,
  updatePageController,
);

router.delete(
  '/pages/:pageId',
  auth,
  rolesAccess([SUPERADMIN, ADMIN]),
  idValidator('pageId'),
  checkValidation,
  deletePageController,
);

router.delete('/pages', auth, rolesAccess([SUPERADMIN, ADMIN]), deletePageController);

export default router;
