import express from 'express';

import auth from '../middlewares/auth.js';

import {
  createCategoryController,
  getCategoriesController,
  updateCategoryController,
  deleteCategoryController,
} from '../controllers/categories.controllers.js';

const router = express.Router();

router.get('/categories/:categoryId', getCategoriesController);

router.get('/categories', getCategoriesController);

router.post('/categories', auth, createCategoryController);

router.patch('/categories/:categoryId', auth, updateCategoryController);

router.patch('/categories', auth, updateCategoryController);

router.delete('/categories/:categoryId', auth, deleteCategoryController);

router.delete('/categories', auth, deleteCategoryController);

export default router;
