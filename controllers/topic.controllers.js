import {
  createTopicService,
  getTopicsService,
  updateTopicService,
  deleteTopicService,
} from '../services/topic.services.js';

export const createTopic = async (req, res, next) => {
  const { title, slug, image, description, status } = req.body;

  try {
    await createTopicService(title, slug, image, description, status);
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
    const topics = await getTopicsService(whereOptions);
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
  try {
    await updateTopicService({ ...req.body }, { id: topicId });
    res.status(200).json({
      message: 'Topic successfully updated',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Could not update this topic',
    });
  }
};

export const deleteTopic = async (req, res, next) => {};
