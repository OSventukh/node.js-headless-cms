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
  const { topicId } = req.params;
  const { id, title, slug, description, status } = req.query;

  let whereOptions;
  if (topicId) {
    whereOptions = {
      id: topicId,
    };
  }

  if (id || title || slug || description || status) {
    whereOptions = {
      ...(id && { id }),
      ...(title && { title }),
      ...(slug && { slug }),
      ...(description && { description }),
      ...(status && { status }),
    };
  }

  try {
    const topics = await getService(Topic, whereOptions);
    res.status(200).json({
      topics,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Could not find topic(s)',
    });
  }
};

export const updateTopic = async (req, res, next) => {
  const { topicId } = req.params;
  const { id, ...toUpdate } = req.body;

  try {
    const topic = await getService(Topic, { id: topicId || id });

    if (!topic || topic.length === 0) {
      throw new Error('This topic does not exist');
    }

    await updateService(Topic, toUpdate, { id: topicId || id });

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
  const { topicIds } = req.body;
  try {
    const topics = await getService(Topic, { id: { [Op.in]: topicIds } });

    if (!topics || topics.length === 0) {
      throw new Error('This topic does not exist');
    }

    Promise.all(
      topicIds.map(async (id) => {
        await deleteService(Topic, { id });
      }),
    );
    res.status(200).json({
      message: 'Topic was succesfully deleted',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Could not delete post',
    });
  }
};
