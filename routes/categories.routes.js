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
  idValidator,
  paginationValidator,
} from '../utils/validators.js';
import checkValidation from '../middlewares/validation.js';
import { ADMIN } from '../utils/constants/roles.js';

const router = express.Router();

router.get(
  '/categories',
  paginationValidator(),
  checkValidation,
  getCategoriesController
);

router.get(
  '/categories/:categoryId',
  idValidator('categoryId'),
  paginationValidator(),
  checkValidation,
  getCategoriesController
);

router.post(
  '/categories',
  auth,
  rolesAccess([ADMIN]),
  categoryValidator(),
  checkValidation,
  createCategoryController
);

router.patch(
  '/categories/:categoryId',
  auth,
  idValidator('categoryId'),
  categoryValidator(),
  checkValidation,
  updateCategoryController
);

router.patch(
  '/categories',
  auth,
  categoryValidator(),
  checkValidation,
  updateCategoryController
);

router.delete(
  '/categories/:categoryId',
  auth,
  idValidator('categoryId'),
  checkValidation,
  deleteCategoryController
);

router.delete('/categories', auth, deleteCategoryController);

export default router;
