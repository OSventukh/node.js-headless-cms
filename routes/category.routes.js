import express from 'express';

import {
  createCategoryController,
  getCategoriesController,
  updateCategoryController,
  deleteCategoryController,
} from '../controllers/categories.controllers';

const router = express.Router();

router.get('/category/:categoryId', getCategoriesController);

router.get('/category', getCategoriesController);

router.post('/category', createCategoryController);

router.patch('/category/:categoryId', updateCategoryController);

router.patch('/category', updateCategoryController);

router.delete('/category/:categoryId', deleteCategoryController);

router.delete('/category', deleteCategoryController);

export default router;
