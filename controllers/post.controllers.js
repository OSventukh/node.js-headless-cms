import { createPost, getOnePost } from '../services/post.services.js';

export const getAllPosts = async (req, res, next) => {};

export const getPost = async (req, res, next) => {
  const { postId } = req.params;
  console.log(req.body)
  try {
    const post = await getOnePost(postId);
    res.status(200).json({
      post: post,
    });
  } catch (error) {
    res.status(404).json({
      message: 'Could not find this post',
    });
  }
};

export const addPost = async (req, res, next) => {
  const { title, content, excerpt, slug, status } = req.body;

  try {
    await createPost(title, content, excerpt, slug, status);
    res.status(201).json({
      message: 'Post successfully created',
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deletePost = async (req, res, next) => {};
