import { Op } from 'sequelize';
import { Post, Topic, Category } from '../models/index.js';
import HttpError from '../utils/http-error.js';
import { checkIncludes } from '../utils/models.js';

const avaibleIncludes = ['topics', 'categories', 'author'];

export const createPost = async (postData) => {
  try {
    // Create post and find topic and category that provided in data form client
    const [post, topic, category] = await Promise.all([
      Post.create(postData),
      Topic.findByPk(postData.topicId),
      Category.findByPk(postData.categoryId),
    ]);

    // Add category and topic to post
    await Promise.all([
      post.addCategory(category?.id || 1),
      post.addTopic(topic?.id || 1),
    ]);
    return post;
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

export const getPosts = async (
  whereQuery = {},
  includeQuery = '',
  orderQuery,
  offset,
  limit,
) => {
  try {
    const { id, title, slug, status } = whereQuery;
    // Convert provided include query to array and check if it avaible for this model
    const include = checkIncludes(includeQuery, avaibleIncludes);
    const result = await Post.findAndCountAll({
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

export const updatePost = async (id, toUpdate) => {
  try {
    const post = await Post.findByPk(id);
    if (!post) {
      throw new HttpError('Post with this id not found', 404);
    }

    const result = await Post.update(toUpdate, {
      where: {
        id,
      },
    });
    if (result[0] === 0) {
      throw new HttpError('Post was not updated', 400);
    }
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};

export const deletePost = async (id) => {
  try {
    const postsId = Array.of(id).flat();

    const posts = await Post.findAll({
      where: {
        id: {
          [Op.in]: postsId,
        },
      },
    });

    if (!posts || posts.length === 0) {
      const errorMessage = postsId.length > 1 ? 'Posts not found' : 'Post not found';
      throw new HttpError(errorMessage, 404);
    }

    const result = await Post.destroy({
      where: {
        id: {
          [Op.in]: postsId,
        },
      },
    });

    if (result === 0) {
      throw new HttpError('Post was not deleted', 400);
    }

    return result;
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};
