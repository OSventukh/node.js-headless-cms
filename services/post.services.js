import db from '../models/index.js';

export const createPost = async (title, content, excerpt, slug, status) => {
  try {
    const { Post } = await db;
    const post = await Post.create({ title, content, excerpt, slug, status });
    return post;
  } catch (error) {
    console.log(error.message);
    throw new Error('Creating post failed');
  }
};

export const getOnePost = async (id) => {
  try {
    const { Post } = await db;
    const post = await Post.findOne({
      where: {
        id,
      },
    });
    return post;
  } catch (error) {
    throw new Error('Could not find this post');
  }
};

export const getMultiplePosts = async (whereOptions = {}, includeOptions = []) => {
  try {
    const { Post } = await db;
    const posts = await Post.findAll({
      where: whereOptions,
      include: includeOptions,
    });
    return posts;
  } catch (error) {
    console.log(error.message);
    throw new Error('Could not find these posts');
  }
};
