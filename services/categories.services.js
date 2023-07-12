import { Op } from 'sequelize';
import { Category } from '../models/index.js';
import HttpError from '../utils/http-error.js';
import {
  checkIncludes,
  checkAttributes,
  buildWhereObject,
  getOrder,
  getPagination,
} from '../utils/models.js';
import slugifyString from '../utils/slugify.js';

export const createCategory = async ({ parentId, ...categoryData }) => {
  try {
    const category = await Category.create({
      ...categoryData,
      slug: categoryData?.slug
        ? slugifyString(categoryData.slug)
        : slugifyString(categoryData.name),
    });

    const parentCategory = await Category.findByPk(parentId);

    if (parentCategory && parentCategory.parentId) {
      throw new HttpError(
        'The category you want to select as a parent is a child of another category. Only one level of nesting is allowed.',
        400
      );
    }

    // add association between category and parent category topics
    if (parentCategory) {
      await category.setParent(parentCategory);
      const topicsParentCategory = await parentCategory.getTopics();
      if (topicsParentCategory.length > 0) {
        await category.setTopics(topicsParentCategory);
      }
    }
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
    throw new HttpError(
      error.message || 'Something went wrong',
      error.statusCode || 500
    );
  }
};

export const getCategories = async (
  whereQuery,
  includeQuery,
  orderQuery,
  page,
  size,
  columns
) => {
  try {
    // Convert provided include query to array and check if it avaible for this model
    const avaibleIncludes = ['posts', 'parent', 'children'];
    const include = checkIncludes(includeQuery, avaibleIncludes);

    // Check if provided query avaible for filtering this model
    const avaibleColumns = [
      'id',
      'name',
      'slug',
      'categories',
      'parentId',
      'createdAt',
      'updatedAt',
    ];
    const whereObj = buildWhereObject(whereQuery, avaibleColumns);
    const attributes = checkAttributes(columns, avaibleColumns);

    const order = await getOrder(orderQuery, Category);

    const { offset, limit } = getPagination(page, size);

    const result = await Category.findAndCountAll({
      where: {
        ...whereObj,
      },
      include: [
        ...include,
        include.includes('children') &&
          attributes?.length > 0 && {
            model: Category,
            as: 'children',
            attributes: [...attributes, 'id'],
          },
      ].filter(Boolean),
      order: order,
      offset,
      limit,
      ...(columns && { attributes: ['id', ...attributes] }),
      subQuery: false,

    });
    return result;
  } catch (error) {
    throw new HttpError(
      error.message || 'Something went wrong',
      error.statusCode || 500
    );
  }
};

export const updateCategory = async (id, { parentId, ...toUpdate }) => {
  try {
    const [category, parentCategory] = await Promise.all([
      Category.findByPk(id, { include: ['children'] }),
      Category.findByPk(parentId),
    ]);

    if (!category) {
      throw new HttpError('Category with this id not found', 404);
    }

    if (
      parentCategory &&
      (category.id === parentCategory.id ||
        parentCategory.parentId === category.id)
    ) {
      throw new HttpError('This category cannot be the parent category', 400);
    }

    if (parentCategory && category.children.length > 0) {
      throw new HttpError(
        'This category contains child category. Only one level of nesting is allowed.',
        400
      );
    }

    if (parentCategory && parentCategory.parentId) {
      throw new HttpError(
        'The category you want to select as a parent is a child of another category. Only one level of nesting is allowed.',
        400
      );
    }

    await Promise.all([
      category.setParent(parentCategory),
      Category.update(
        {
          ...toUpdate,
          slug: toUpdate?.slug
            ? slugifyString(toUpdate.slug)
            : slugifyString(toUpdate.name),
        },
        {
          where: {
            id,
          },
        }
      ),
    ]);

    if (parentCategory) {
      await category.setParent(parentCategory);
      const topicsParentCategory = await parentCategory.getTopics();
      if (topicsParentCategory.length > 0) {
        await category.setTopics(topicsParentCategory);
      }
    }
  } catch (error) {
    throw new HttpError(
      error.message || 'Something went wrong',
      error.statusCode || 500
    );
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
      const errorMessage =
        categoriesId.length > 1 ? 'Categories not found' : 'Category not found';
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
    throw new HttpError(
      error.message || 'Something went wrong',
      error.statusCode || 500
    );
  }
};
