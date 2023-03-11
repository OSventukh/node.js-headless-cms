import express from 'express';

import auth from '../middlewares/auth.js';

import {
  createPostController,
  getPostsController,
  updatePostController,
  deletePostController,
} from '../controllers/posts.controllers.js';

import { postValidator, idValidator } from '../utils/validators.js';
import checkValidation from '../middlewares/validation.js';

const router = express.Router();

router.get('/posts/:postId', idValidator(), checkValidation, getPostsController);

router.get('/posts', getPostsController);

router.post('/posts', auth, postValidator(), checkValidation, createPostController);

router.patch('/posts/:postId', auth, postValidator(), idValidator(), checkValidation, updatePostController);

router.patch('/posts', auth, postValidator(), checkValidation, updatePostController);

router.delete('/posts/:postId', auth, idValidator(), checkValidation, deletePostController);

router.delete('/posts', auth, deletePostController);

export default router;
