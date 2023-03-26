import express from 'express';

import { auth, rolesAccess, canEditPost } from '../middlewares/auth.js';

import {
  createPostController,
  getPostsController,
  updatePostController,
  deletePostController,
} from '../controllers/posts.controllers.js';

import {
  postValidator,
  idValidator,
  paginationValidator,
} from '../utils/validators.js';
import checkValidation from '../middlewares/validation.js';
import { ADMIN, MODER, WRITER } from '../utils/constants/roles.js';

const router = express.Router();

router.get(
  '/posts/:postId',
  idValidator('postId'),
  paginationValidator(),
  checkValidation,
  getPostsController,
);

router.get(
  '/posts',
  paginationValidator(),
  checkValidation,
  getPostsController,
);

router.post(
  '/posts',
  auth,
  rolesAccess([ADMIN, MODER, WRITER]),
  postValidator(),
  checkValidation,
  createPostController,
);

router.patch(
  '/posts/:postId',
  auth,
  rolesAccess([ADMIN, MODER, WRITER]),
  canEditPost,
  postValidator(),
  idValidator('postId'),
  checkValidation,
  updatePostController,
);

router.patch(
  '/posts',
  auth,
  rolesAccess([ADMIN, MODER, WRITER]),
  canEditPost,
  postValidator(),
  checkValidation,
  updatePostController,
);

router.delete(
  '/posts/:postId',
  auth,
  rolesAccess([ADMIN, MODER, WRITER]),
  canEditPost,
  idValidator('postId'),
  checkValidation,
  deletePostController,
);

router.delete('/posts', auth, rolesAccess([ADMIN, MODER, WRITER]), canEditPost, deletePostController);

export default router;
