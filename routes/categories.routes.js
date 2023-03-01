import express from 'express';

import {
  createCategoryController,
  getCategoriesController,
  updateCategoryController,
  deleteCategoryController,
} from '../controllers/categories.controllers.js';

const router = express.Router();

router.get('/categories/:categoryId', getCategoriesController);

router.get('/categories', getCategoriesController);

router.post('/categories', createCategoryController);

router.patch('/categories/:categoryId', updateCategoryController);

router.patch('/categories', updateCategoryController);

router.delete('/categories/:categoryId', deleteCategoryController);

router.delete('/categories', deleteCategoryController);

export default router;
