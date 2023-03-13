import { Op } from 'sequelize';
import { Topic } from '../models/index.js';
import HttpError from '../utils/http-error.js';
import { checkIncludes } from '../utils/models.js';

const avaibleIncludes = ['users', 'pages', 'posts', 'categories'];

export const createTopic = async (topicDate) => {
  try {
    const topic = await Topic.create(topicDate);
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
  whereQuery = {},
  includeQuery,
  orderQuery,
  offset,
  limit,
) => {
  try {
    const { id, title, slug, status } = whereQuery;
    // Convert provided include query to array and check if it avaible for this model
    const include = checkIncludes(includeQuery, avaibleIncludes);
    const result = await Topic.findAndCountAll({
      where: {
        ...(id && { id }),
        ...(title && { title }),
        ...(slug && { slug }),
        ...(status && { status }),
      },
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

export const updateTopic = async (id, toUpdate) => {
  try {
    const topic = await Topic.findByPk(id);
    if (!topic) {
      throw new HttpError('Topic with this id not found', 404);
    }

    const result = await Topic.update(toUpdate, {
      where: {
        id,
      },
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
