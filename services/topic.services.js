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

export const updateTopicService = async (toUpdate, whereOptions) => {
  try {
    const { Topic } = await db;
    const result = Topic.update(
      toUpdate,
      {
        where: whereOptions,
      },
    );

    if (result[0] === 0) {
      throw new Error('Could not update this topic');
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

export const deleteTopicService = async (whereOptions) => {
  try {
    const { Topic } = await db;
    await Topic.destroy({
      where: whereOptions,
    });
  } catch (error) {
    throw new Error(error.message);
  }
};
