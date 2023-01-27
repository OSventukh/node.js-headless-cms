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
        id: id,
      },
    });
    return post;
  } catch (error) {
    throw new Error('Could not find this post');
  }
};
