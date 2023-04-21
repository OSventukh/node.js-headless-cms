import { Op } from 'sequelize';
import { sequelize, Post, Topic, Category } from '../models/index.js';
import HttpError from '../utils/http-error.js';
import {
  checkIncludes,
  buildWhereObject,
  getOrder,
  getPagination,
} from '../utils/models.js';

const transformData = (data) => {
  // extract title from all content
  const title = data?.rawContent?.match(/<h1>(.*?)<\/h1>/)[1];

  if (!title || title.trim().length === 0) {
    throw new HttpError('Title should not be an empty', 400);
  }

  // Remove title from content
  const contentWithoutTitle = data.rawContent.replace(/<h1>.*?<\/h1>/, '');

  // We divide the content using the separator presented in CKEditor;
  const [excerpt, others] = contentWithoutTitle.split(
    '<div class="page-break" style="page-break-after:always;"><span style="display:none;">&nbsp;</span></div>'
  );

  const content = others ? excerpt + others : excerpt;

  return {
    title,
    excerpt,
    content,
    slug: data.slug,
    status: data.status,
  };
};

export const createPost = async ({ topicId, categoryId, ...postData }) => {
  try {
    // Сheck whether the given ids is an array, and if it is not, it converts it into an array.
    const topicsIds = Array.isArray(topicId) ? topicId : [topicId];
    const categoriesIds = Array.isArray(categoryId) ? categoryId : [categoryId];

    const transformedData = transformData(postData);

    // Create post and find topic and category that provided in data form client
    const [post, topics, categories] = await Promise.all([
      Post.create(transformedData),
      Topic.findAll({
        where: {
          id: {
            [Op.in]: topicsIds,
          },
        },
      }),
      Category.findAll({
        where: {
          id: {
            [Op.in]: categoriesIds,
          },
        },
      }),
    ]);

    if (!topics && topics.length === 0) {
      throw new HttpError('No topic selected', 400);
    }

    if (!categories && categories.length === 0) {
      throw new HttpError('No topic selected', 400);
    }

    // Add categories and topics to post
    await Promise.all([post.addCategories(categories), post.addTopics(topics)]);
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
    throw new HttpError(
      error.message || 'Something went wrong',
      error.statusCode || 500
    );
  }
};

export const getPosts = async (
  whereQuery,
  includeQuery,
  orderQuery,
  page,
  size
) => {
  try {
    // Convert provided include query to array and check if it avaible for this model
    const avaibleIncludes = ['topics', 'categories', 'author'];
    const include = checkIncludes(includeQuery, avaibleIncludes);

    // Check if provided query avaible for filtering this model
    const avaibleWheres = ['id', 'title', 'slug', 'status'];
    const whereObj = buildWhereObject(whereQuery, avaibleWheres);

    const order = await getOrder(orderQuery, Post);

    const { offset, limit } = getPagination(page, size);

    const result = await Post.findAndCountAll({
      where: whereObj,
      include,
      order,
      offset,
      limit,
    });
    return result;
  } catch (error) {
    throw new HttpError(
      error.message || 'Something went wrong',
      error.statusCode || 500
    );
  }
};

export const updatePost = async (id, { topicId, categoryId, ...toUpdate }) => {
  // Сheck whether the given ids is an array, and if it is not, it converts it into an array.
  const topicsIds = Array.isArray(topicId) ? topicId : [topicId];
  const categoriesIds = Array.isArray(categoryId) ? categoryId : [categoryId];

  try {
    // Find if exist post, categories and topics with provided id
    const [post, topics, categories] = await Promise.all([
      Post.findByPk(id),
      Topic.findAll({
        where: {
          id: {
            [Op.in]: topicsIds,
          },
        },
      }),
      Category.findAll({
        where: {
          id: {
            [Op.in]: categoriesIds,
          },
        },
      }),
    ]);
    if (!post) {
      throw new HttpError('Post with this id not found', 404);
    }
    // Update post, and set new categories and topics
    const transformedData = transformData(toUpdate);

    const result = await sequelize.transaction(async (transaction) => {
      const updatedData = await Promise.all([
        post.setCategories(categories, { transaction }),
        post.setTopics(topics, { transaction }),
        Post.update(transformedData, {
          where: {
            id,
          },
          transaction,
        }),
      ]);
      return updatedData[2];
    });
    if (result[0] === 0) {
      throw new HttpError('Post was not updated', 400);
    }
  } catch (error) {
    throw new HttpError(
      error.message || 'Something went wrong',
      error.statusCode || 500
    );
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
    throw new HttpError(
      error.message || 'Something went wrong',
      error.statusCode || 500
    );
  }
};
