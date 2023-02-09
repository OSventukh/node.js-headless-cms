import db from '../models/index.js';

export const createTopicService = async (
  title,
  slug,
  image,
  description,
  status,
) => {
  try {
    const { Topic } = await db;
    const topic = await Topic.create({
      title,
      slug,
      image,
      description,
      status,
    });
    return topic;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getTopicsService = async (
  whereOptions = {},
  includeOptions = [],
  orderOptions = [],
) => {
  try {
    const { Topic } = await db;
    const topics = await Topic.findAll({
      where: whereOptions,
      include: includeOptions,
      order: orderOptions,
    });
    return topics;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const updateTopicService = async () => {};

export const deleteTopicService = async () => {};
