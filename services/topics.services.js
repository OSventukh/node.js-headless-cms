import { Op } from 'sequelize';
import { Topic, Category, sequelize } from '../models/index.js';
import HttpError from '../utils/http-error.js';
import { checkIncludes, buildWhereObject, getOrder, getPagination, checkAttributes } from '../utils/models.js';

async function getAllChildCategories(categories) {
  let allCategories = [...categories];
  await Promise.all(categories.map(async (category) => {
    const childCategories = await category.getChildren();
    allCategories = allCategories.concat(childCategories);
  }));
  return allCategories;
}

export const createTopic = async (topicData) => {
  // Сheck whether the given ids is an array, and if it is not, it converts it into an array.
  const categoriesIds = Array.isArray(topicData.categoryId)
    ? topicData.categoryId
    : [topicData.categoryId];
  try {
    const [topic, categories] = await Promise.all([
      Topic.create(topicData),
      Category.findAll({
        where: {
          id: {
            [Op.in]: categoriesIds,
          },
        },
      }),
    ]);
    await topic.addCategories(categories);
    return topic;
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

export const getTopics = async (
  whereQuery,
  includeQuery,
  orderQuery,
  page,
  size,
  columns,
) => {
  try {
    // Convert provided include query to array and check if it avaible for this model
    const avaibleIncludes = ['users', 'pages', 'posts', 'categories', 'parent'];
    const include = checkIncludes(includeQuery, avaibleIncludes);

    // Check if provided query avaible for filtering this model
    const avaibleColumns = ['id', 'title', 'slug', 'image', 'description', 'status', 'parentId', 'categories', 'createdAt', 'updatedAt'];
    const whereObj = buildWhereObject(whereQuery, avaibleColumns);
    const attributes = checkAttributes(columns, avaibleColumns);

    const order = await getOrder(orderQuery, Topic);

    const { offset, limit } = getPagination(page, size);
    const result = await Topic.findAndCountAll({
      where: whereObj,
      include,
      order,
      offset,
      limit,
      ...(columns && { attributes: ['id', ...attributes] }),
    });

    return result;
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};

export const updateTopic = async (id, toUpdate) => {
  // Сheck whether the given ids is an array, and if it is not, it converts it into an array.
  const categoriesIds = Array.isArray(toUpdate.categoryId)
    ? toUpdate.categoryId
    : [toUpdate.categoryId];
  try {
    const [topic, categories] = await Promise.all([
      Topic.findByPk(id),
      Category.findAll({
        where: {
          id: {
            [Op.in]: categoriesIds,
          },
        },
      }),
    ]);

    if (!topic) {
      throw new HttpError('Topic with this id not found', 404);
    }

    const categoriesWithChild = await getAllChildCategories(categories);

    const result = await sequelize.transaction(async (transaction) => {
      const updatedData = await Promise.all([
        topic.setCategories(categoriesWithChild, { transaction }),
        Topic.update(toUpdate, {
          where: {
            id,
          },
          transaction,
        }),
      ]);
      return updatedData[1];
    });
    if (result[0] === 0) {
      throw new HttpError('Topic was not updated', 400);
    }
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};

export const deleteTopic = async (id) => {
  try {
    const topicsId = Array.of(id).flat();
    const topics = await Topic.findAll({
      where: {
        id: {
          [Op.in]: topicsId,
        },
      },
    });

    if (!topics || topics.length === 0) {
      const errorMessage = topicsId.length > 1 ? 'Topics not found' : 'Topic not found';
      throw new HttpError(errorMessage, 404);
    }

    const result = await Topic.destroy({
      where: {
        id: {
          [Op.in]: topicsId,
        },
      },
    });

    if (result === 0) {
      throw new HttpError('Topic was not deleted', 400);
    }

    return result;
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};

export const getTopicCategories = async (topicsIds) => {
  try {
    const topics = await Topic.findAll({
      where: {
        id: {
          [Op.in]: topicsIds.split(','),
        },
      },
      include: ['categories'],
    });

    const categories = topics.map((topic) => topic.categories).flat();
    return categories;
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};
