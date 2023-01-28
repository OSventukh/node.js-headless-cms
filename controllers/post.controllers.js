import {
  createPostService,
  getOnePostService,
  getMultiplePostsService,
  deletePostService,
} from '../services/post.services.js';

export const getAllPosts = async (req, res, next) => {
  try {
    const posts = await getMultiplePostsService();
    res.status(200).json({
      posts,
    });
  } catch (error) {
    res.status(404).json({
      message: 'Could not find these posts',
    });
  }
};

export const getPost = async (req, res, next) => {
  const { postId } = req.params;

  try {
    const post = await getOnePostService(postId);
    res.status(200).json({
      post,
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
    await createPostService(title, content, excerpt, slug, status);
    res.status(201).json({
      message: 'Post successfully created',
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deletePost = async (req, res, next) => {
  const { postIds } = req.body;

  try {
    Promise.all(
      postIds.map(async (id) => {
        await deletePostService({ id });
      }),
    );
    res.status(200).json({
      message: 'Post was successfully deleted',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Deleting post failed',
    });
  }
};
