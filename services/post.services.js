import db from '../models/index.js';

export const createPostService = async (
  title,
  content,
  excerpt,
  slug,
  status,
) => {
  try {
    const { Post } = await db;
    const post = await Post.create({ title, content, excerpt, slug, status });
    return post;
  } catch (error) {
    throw new Error('Creating post failed');
  }
};

export const getPostsService = async (
  whereOptions = {},
  includeOptions = [],
  orderOptions = [],
) => {
  try {
    const { Post } = await db;
    const posts = await Post.findAll({
      where: whereOptions,
      include: includeOptions,
      order: orderOptions,
    });
    return posts;
  } catch (error) {
    throw new Error('Could not find these posts');
  }
};

export const deletePostService = async (whereOption) => {
  try {
    const { Post } = await db;
    await Post.destroy({
      where: whereOption,
    });
  } catch (error) {
    throw new Error('Could not delete this post');
  }
};
