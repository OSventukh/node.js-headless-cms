import express from 'express';

import auth from '../middlewares/auth.js';

import {
  createPostController,
  getPostsController,
  updatePostController,
  deletePostController,
} from '../controllers/posts.controllers.js';

const router = express.Router();

router.get('/posts/:postId', getPostsController);

router.get('/posts', getPostsController);

router.post('/posts', auth, createPostController);

router.patch('/posts/:postId', auth, updatePostController);

router.patch('/posts', auth, updatePostController);

router.delete('/posts/:postId', auth, deletePostController);

router.delete('/posts', auth, deletePostController);

export default router;
