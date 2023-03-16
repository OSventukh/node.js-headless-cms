import HttpError from '../utils/http-error.js';

import {
  createTopic,
  getTopics,
  updateTopic,
  deleteTopic,
} from '../services/topics.services.js';

export const createTopicController = async (req, res, next) => {
  try {
    const topic = await createTopic(req.body);
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
  const { include, order, page, size, ...whereQuery } = req.query;

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
  // Receive topic id from url params or request body
  const topicId = req.params.topicId || req.body.id;

  // Divide the request body into data that will be updated and topic id if it was passed.
  // Id should remain unchanged
  const { id, ...toUpdate } = req.body;

  try {
    await updateTopic(topicId, toUpdate);

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
      message: result > 1 ? 'Topics were successfully deleted' : 'Topic was successfully deleted',
      count: result,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};
