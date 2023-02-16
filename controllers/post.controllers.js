import {
  createService,
  deleteService,
  getService,
  updateService,
} from '../services/services.js';

import db from '../models/index.js';

const { Post } = db;

export const createPost = async (req, res, next) => {
  const { title, content, excerpt, slug, status } = req.body;

  try {
    await createService(Post, req.body);
    res.status(201).json({
      message: 'Post successfully created',
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getPosts = async (req, res, next) => {
  const { postId } = req.params;
  const { slug, status } = req.query;

  let whereOptions;

  if (postId) {
    whereOptions = { id: postId };
  }

  if (slug || status) {
    whereOptions = {
      ...(slug && { slug }),
      ...(status && { status }),
    };
  }

  try {
    const post = await getService(Post, whereOptions);
    res.status(200).json({
      post,
    });
  } catch (error) {
    res.status(404).json({
      message: 'Could not find this post',
    });
  }
};

export const updatePost = async (req, res, next) => {
  const { postId } = req.params;
  try {
    await updateService(Post, { ...req.body }, { id: postId });
    res.status(201).json({
      message: 'Post successfully updated',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Could not update this post',
    });
  }
};

export const deletePost = async (req, res, next) => {
  const { postIds } = req.body;

  try {
    Promise.all(
      postIds.map(async (id) => {
        await deleteService(Post, { id });
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
