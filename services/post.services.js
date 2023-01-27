import db from '../models/index.js';

export const createPost = async (title, content, excerpt, slug, status) => {
  try {
    const { Post } = await db;
    const post = await Post.create({ title, content, excerpt, slug, status });
    return post;
  } catch (error) {
    console.log(error.message)
    throw new Error('Creating post failed');
  }
};
