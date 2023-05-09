import path from 'path';
import HttpError from '../utils/http-error.js';
import {
  createTopic,
  getTopics,
  updateTopic,
  deleteTopic,
  getTopicCategories,
} from '../services/topics.services.js';

export const createTopicController = async (req, res, next) => {
  try {
    const imagePath = req.file
      ? path.join('uploads', 'images', 'topics', req.file.filename)
      : '';
    const topic = await createTopic({ ...req.body, image: imagePath });
    res.status(201).json({
      message: 'Topic successfully created',
      topic,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const getTopicsController = async (req, res, next) => {
  // receive topic id from url params or query
  const id = req.params.topicId || req.query.id;
  const { include, order, page, size, columns, ...whereQuery } = req.query;

  try {
    // getting topics with provided paramaters and response it to the client
    const { count, rows } = await getTopics(
      {
        id,
        ...whereQuery,
      },
      include,
      order,
      page,
      size,
      columns
    );
    res.status(200).json({
      count,
      currentPage: page,
      totalPages: Math.ceil(count / size),
      topics: rows,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const updateTopicController = async (req, res, next) => {
  try {
    // Receive topic id from url params or request body
    const topicId = req.params.topicId || req.body.id;
    // Divide the request body into data that will be updated and topic id if it was passed.
    // Id should remain unchanged
    const { id, ...toUpdate } = req.body;
    const imagePath = req.file
      ? path.join('uploads', 'images', 'topics', req.file.filename)
      : '';
    await updateTopic(topicId, {
      ...toUpdate,
      ...(imagePath && { image: imagePath }),
    });

    res.status(200).json({
      message: 'Topic was successfully updated',
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const deleteTopicController = async (req, res, next) => {
  // receive topic id from url params or request body
  const topicId = req.params.topicId || req.body.id;

  try {
    // deleting all users with given id
    const result = await deleteTopic(topicId);

    res.status(200).json({
      message:
        result > 1
          ? 'Topics were successfully deleted'
          : 'Topic was successfully deleted',
      count: result,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const getTopicCategoriesController = async (req, res, next) => {
  try {
    const topicsIds = req.query.topics;

    if (!topicsIds) {
      res.status(200).json({
        categories: [],
      });
      return;
    }

    const categories = await getTopicCategories(topicsIds);
    res.status(200).json({
      categories,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};
