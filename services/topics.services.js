import { Op } from 'sequelize';
import { Topic, Category, sequelize } from '../models/index.js';
import HttpError from '../utils/http-error.js';
import { checkIncludes, buildWhereObject, getOrder } from '../utils/models.js';

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
  offset,
  limit,
) => {
  try {
    // Convert provided include query to array and check if it avaible for this model
    const avaibleIncludes = ['users', 'pages', 'posts', 'categories'];
    const include = checkIncludes(includeQuery, avaibleIncludes);

    // Check if provided query avaible for filtering this model
    const avaibleWheres = ['id', 'title', 'slug', 'status'];
    const whereObj = buildWhereObject(whereQuery, avaibleWheres);

    const order = await getOrder(orderQuery, Topic);

    const result = await Topic.findAndCountAll({
      where: whereObj,
      include,
      order,
      offset,
      limit,
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
            [Op]: [categoriesIds],
          },
        },
      }),
    ]);

    if (!topic) {
      throw new HttpError('Topic with this id not found', 404);
    }
    const result = await sequelize.transaction(async (transaction) => {
      const updatedData = await Promise.all([
        topic.setCategories(categories, { transaction }),
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
