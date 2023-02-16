import { Op } from 'sequelize';

import {
  createService,
  getService,
  updateService,
  deleteService,
} from '../services/services.js';

import db from '../models/index.js';

const { Topic } = db;

export const createTopic = async (req, res, next) => {
  try {
    await createService(Topic, req.body);
    res.status(201).json({
      message: 'Topic successfully created',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Could not create topic',
    });
  }
};

export const getTopics = async (req, res, next) => {
  // receive topic id from url params or query
  const id = req.params.topicId || req.query.id;
  // receive other parameters from url query
  const { title, slug, description, status } = req.query;

  // If parameter was provided add it to object which will be passed as where query to sequelize
  const whereOptions = {
    ...(id && { id }),
    ...(title && { title }),
    ...(slug && { slug }),
    ...(description && { description }),
    ...(status && { status }),
  };

  try {
    // getting topics with provided paramaters and response it to the client
    const topics = await getService(Topic, whereOptions);
    res.status(200).json({
      topics,
    });
  } catch (error) {
    res.status(404).json({
      message: 'Could not find topic(s)',
    });
  }
};

export const updateTopic = async (req, res, next) => {
  // Receive topic id from url params or request body
  const topicId = req.params.topicId || req.body.id;

  // Divide the request body into data that will be updated and topic id if it was passed.
  // Id should remain unchanged
  const { id, ...toUpdate } = req.body;

  try {
    // Check if topic or topics with provided id are exists
    const topic = await getService(Topic, { id: topicId });

    if (!topic || topic.length === 0) {
      throw new Error('This topic does not exist');
    }

    // update existing topic
    await updateService(Topic, toUpdate, { id: topicId });

    res.status(200).json({
      message: 'Topic was successfully updated',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Could not update this topic',
    });
  }
};

export const deleteTopic = async (req, res, next) => {
  // receive topic id from url params or request body
  let topicId = req.params.topicId || req.body.id;

  // transform topic id to array if it is not
  if (topicId && !Array.isArray(topicId)) {
    topicId = [topicId];
  }

  try {
    // Checking if topic or topics with passed id(s) is exists
    const topics = await getService(Topic, {
      id: { [Op.in]: topicId },
    });

    if (!topics || topics.length === 0) {
      throw new Error('This topic does not exist');
    }
    // deleting all topics with given id
    Promise.all(
      topicId.map(async (id) => {
        await deleteService(Topic, { id });
      }),
    );
    res.status(200).json({
      message: 'Topic was succesfully deleted',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Could not delete topic',
    });
  }
};
