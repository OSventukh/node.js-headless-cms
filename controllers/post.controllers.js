import { Op } from 'sequelize';

import {
  createService,
  deleteService,
  getService,
  updateService,
} from '../services/services.js';

import db from '../models/index.js';

const { Post } = db;

export const createPost = async (req, res, next) => {
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
  // Receive post id from url params or query
  const id = req.params.postId || req.query.id;

  // Receive other parameters from url query
  const { title, slug, status } = req.query;

  // If parameters was provided add it to object which will be passed as where query to sequelize
  const whereOptions = {
    ...(id && { id }),
    ...(title && { title }),
    ...(slug && { slug }),
    ...(status && { status }),
  };

  try {
    // get topics with provided parameters and response it to the client
    const posts = await getService(Post, whereOptions);
    res.status(200).json({
      posts,
    });
  } catch (error) {
    res.status(404).json({
      message: 'Could not find this post',
    });
  }
};

export const updatePost = async (req, res, next) => {
  // Receive post id from url params or request body
  const postId = req.params || req.body.id;

  // Divide the request body into data that will be updated and post id
  // Post id should reamin unchanged
  const { id, ...toUpdate } = req.body;

  try {
    // Check if post or posts with provided id are exists
    const posts = await getService(Post, { id: postId });

    if (!posts || posts.length === 0) {
      throw new Error('This posts does not exist');
    }

    // Update existion post
    await updateService(Post, toUpdate, { id: postId });

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
  // Receive post id from url param or request body
  let postId = req.params.postId || req.body.id;

  // Transform post id to array if it is not
  if (postId && !Array.isArray(postId)) {
    postId = [postId];
  }

  try {
    // Check if post or post with provided id are exist
    const posts = await getService(Post, {
      id: { [Op.in]: postId },
    });

    if (!posts || posts.length === 0) {
      throw new Error('This post does not exist');
    }
    Promise.all(
      postId.map(async (id) => {
        await deleteService(Post, { id });
      }),
    );
    res.status(200).json({
      message: 'Post was successfully deleted',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Could not delete post',
    });
  }
};
