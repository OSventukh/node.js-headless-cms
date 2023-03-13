import HttpError from '../utils/http-error.js';

import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from '../services/categories.services.js';

export const createCategoryController = async (req, res, next) => {
  try {
    const category = await createCategory(req.body);
    res.status(201).json({
      message: 'Category successfully created',
      category,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const getCategoriesController = async (req, res, next) => {
  // Receive category id from url params or query
  const id = req.params.categoryId || req.query.id;
  const { include, ...whereQuery } = req.query;
  console.log('Include', [include]);
  try {
    // get topics with provided parameters and response it to the client
    const { count, rows } = await getCategories(
      {
        id,
        ...whereQuery,
      },
      include,
    );
    res.status(200).json({
      count,
      categories: rows,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const updateCategoryController = async (req, res, next) => {
  // Receive category id from url params or request body
  const categoryId = req.params.categoryId || req.body.id;

  // Divide the request body into data that will be updated and category id
  // Category id should reamin unchanged
  const { id, ...toUpdate } = req.body;

  try {
    await updateCategory(categoryId, toUpdate);

    res.status(200).json({
      message: 'Category was successfully updated',
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const deleteCategoryController = async (req, res, next) => {
  // Receive category id from url param or request body
  const categoryId = req.params.categoryId || req.body.id;

  try {
    // deleting all categories with given id
    const result = await deleteCategory(categoryId);

    res.status(200).json({
      message: result > 1 ? 'Categories were successfully deleted' : 'Category was successfully deleted',
      count: result,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};
