import HttpError from '../utils/http-error.js';

import {
  createPost,
  getPosts,
  updatePost,
  deletePost,
} from '../services/posts.services.js';

export const createPostController = async (req, res, next) => {
  try {
    const post = await createPost({ ...req.body, userId: req.authUser.id });
    res.status(201).json({
      message: 'Post successfully created',
      post,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const getPostsController = async (req, res, next) => {
  // Receive post id from url params or query
  const id = req.params.postId || req.query.id;
  const { include, order, page, size, columns, topic, category, slug, ...whereQuery } = req.query;

  try {
    // get topics with provided parameters and response it to the client
    const { count, rows } = await getPosts(
      {
        id,
        slug,
        ...whereQuery,
      },
      include,
      order,
      columns,
      page,
      size,
      topic,
      category,
    );
    if (id || slug) {
      res.status(200).json({
        post: rows[0],
      });
      return;
    }
    res.status(200).json({
      count,
      currentPage: page,
      totalPages: Math.ceil(count / size),
      posts: rows,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const updatePostController = async (req, res, next) => {
  // Receive post id from url params or request body
  const postId = req.params.postId || req.body.id;

  // Divide the request body into data that will be updated and post id
  // Post id should remain unchanged
  const { id, ...toUpdate } = req.body;

  try {
    await updatePost(postId, toUpdate);

    res.status(200).json({
      message: 'Post successfully updated',
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const deletePostController = async (req, res, next) => {
  // Receive post id from url param or request body
  const postId = req.params.postId || req.body.id;

  try {
    // deleting all post with given id
    const result = await deletePost(postId);
    res.status(200).json({
      message:
        result > 1
          ? 'Posts were successfully deleted'
          : 'Post was successfully deleted',
      count: result,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const uploadPostImageController = (req, res) => {
  const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({
    location: imageUrl,
  });
};
