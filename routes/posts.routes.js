import express from 'express';
import {
  createPostController,
  getPostsController,
  updatePostController,
  deletePostController,
} from '../controllers/post.controllers.js';

const router = express.Router();

router.get('/posts/:postId', getPostsController);

router.get('/posts', getPostsController);

router.post('/posts', createPostController);

router.patch('/posts/:postId', updatePostController);

router.patch('/posts', updatePostController);

router.delete('/posts/:postId', deletePostController);

router.delete('/posts', deletePostController);

export default router;
