import express from 'express';

import { auth, rolesAccess } from '../middlewares/auth.js';

import {
  createCategoryController,
  getCategoriesController,
  updateCategoryController,
  deleteCategoryController,
} from '../controllers/categories.controllers.js';

import {
  categoryValidator,
  paginationValidator,
} from '../utils/validators.js';
import checkValidation from '../middlewares/validation.js';
import { SUPERADMIN, ADMIN } from '../utils/constants/users.js';

const router = express.Router();

router.get(
  '/categories',
  paginationValidator(),
  checkValidation,
  getCategoriesController,
);

router.get(
  '/categories/:categoryId',
  paginationValidator(),
  checkValidation,
  getCategoriesController,
);

router.post(
  '/categories',
  auth,
  rolesAccess([SUPERADMIN, ADMIN]),
  categoryValidator(),
  checkValidation,
  createCategoryController,
);

router.patch(
  '/categories/:categoryId',
  auth,
  rolesAccess([SUPERADMIN, ADMIN]),
  categoryValidator(),
  checkValidation,
  updateCategoryController,
);

router.patch(
  '/categories',
  auth,
  rolesAccess([SUPERADMIN, ADMIN]),
  categoryValidator(),
  checkValidation,
  updateCategoryController,
);

router.delete(
  '/categories/:categoryId',
  auth,
  checkValidation,
  deleteCategoryController,
);

router.delete('/categories', auth, deleteCategoryController);

export default router;
