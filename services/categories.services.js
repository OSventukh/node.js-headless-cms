import { Op } from 'sequelize';
import { Category } from '../models/index.js';
import HttpError from '../utils/http-error.js';
import { checkIncludes, buildWhereObject } from '../utils/models.js';

export const createCategory = async (categoryData) => {
  try {
    const category = await Category.create(categoryData);
    return category;
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      throw new HttpError(error.message, 400);
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      const fieldName = Object.entries(error.fields)[0][0];
      const fieldValue = Object.entries(error.fields)[0][1];
      const errorMessage = `The ${fieldName} should be an unique. Value ${fieldValue} is already in use`;
      throw new HttpError(errorMessage, 409);
    }
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};

export const getCategories = async (
  whereQuery = {},
  includeQuery,
  orderQuery,
  offset,
  limit,
) => {
  try {
    // Convert provided include query to array and check if it avaible for this model
    const avaibleIncludes = ['posts'];
    const include = checkIncludes(includeQuery, avaibleIncludes);

    // Check if provided query avaible for filtering this model
    const avaibleWheres = ['id', 'name', 'slug'];
    const whereObj = buildWhereObject(whereQuery, avaibleWheres);

    const result = await Category.findAndCountAll({
      where: whereObj,
      include,
      order: [],
      offset,
      limit,
    });
    return result;
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};

export const updateCategory = async (id, toUpdate) => {
  try {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new HttpError('Category with this id not found', 404);
    }

    const result = await Category.update(toUpdate, {
      where: {
        id,
      },
    });
    if (result[0] === 0) {
      throw new HttpError('Category was not updated', 400);
    }
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};

export const deleteCategory = async (id) => {
  try {
    const categoriesId = Array.of(id).flat();

    const category = await Category.findAll({
      where: {
        id: {
          [Op.in]: categoriesId,
        },
      },
    });

    if (!category || category.length === 0) {
      const errorMessage = categoriesId.length > 1 ? 'Categories not found' : 'Category not found';
      throw new HttpError(errorMessage, 404);
    }

    const result = await Category.destroy({
      where: {
        id: {
          [Op.in]: categoriesId,
        },
      },
    });

    if (result === 0) {
      throw new HttpError('Category was not deleted', 400);
    }

    return result;
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};
