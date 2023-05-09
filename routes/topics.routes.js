import express from 'express';

import { auth, rolesAccess } from '../middlewares/auth.js';
import { SUPERADMIN, ADMIN } from '../utils/constants/roles.js';
import upload from '../utils/multer.js';

import {
  createTopicController,
  getTopicsController,
  updateTopicController,
  deleteTopicController,
  getTopicCategoriesController,
} from '../controllers/topics.controllers.js';

import {
  topicValidator,
  idValidator,
  paginationValidator,
} from '../utils/validators.js';

import checkValidation from '../middlewares/validation.js';

const router = express.Router();

router.get(
  '/topics/:topicId',
  idValidator('topicId'),
  paginationValidator(),
  checkValidation,
  getTopicsController,
);

router.get(
  '/topics',
  paginationValidator(),
  checkValidation,
  getTopicsController,
);

router.post(
  '/topics',
  auth,
  rolesAccess([SUPERADMIN, ADMIN]),
  topicValidator(),
  checkValidation,
  upload.single('topic-image'),
  createTopicController,
);

router.patch(
  '/topics/:topicId',
  auth,
  rolesAccess([SUPERADMIN, ADMIN]),
  topicValidator(),
  idValidator('topicId'),
  checkValidation,
  upload.single('topic-image'),
  updateTopicController,
);

router.patch(
  '/topics',
  auth,
  rolesAccess([SUPERADMIN, ADMIN]),
  topicValidator(),
  checkValidation,
  upload.single('topic-image'),
  updateTopicController,
);

router.delete(
  '/topics/:topicId',
  auth,
  rolesAccess([SUPERADMIN, ADMIN]),
  idValidator('topicId'),
  checkValidation,
  deleteTopicController,
);

router.delete(
  '/topics',
  auth,
  rolesAccess([SUPERADMIN, ADMIN]),
  idValidator('topicId'),
  checkValidation,
  deleteTopicController,
);

router.get('/topiccategories/', auth, getTopicCategoriesController);

export default router;
