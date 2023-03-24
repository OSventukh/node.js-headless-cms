import express from 'express';

import { auth } from '../middlewares/auth.js';

import {
  createUserController,
  getUsersController,
  updateUserController,
  deleteUserController,
} from '../controllers/users.controllers.js';

import {
  userValidator,
  idValidator,
  paginationValidator,
} from '../utils/validators.js';
import checkValidation from '../middlewares/validation.js';

const router = express.Router();

router.get(
  '/users/:userId',
  idValidator('userId'),
  paginationValidator(),
  checkValidation,
  getUsersController
);

router.get(
  '/users',
  paginationValidator(),
  checkValidation,
  getUsersController
);

router.post(
  '/users',
  auth,
  userValidator(),
  checkValidation,
  createUserController
);

router.patch(
  '/users/:userId',
  auth,
  userValidator(),
  idValidator('userId'),
  checkValidation,
  updateUserController
);

router.patch(
  '/users',
  auth,
  userValidator(),
  checkValidation,
  updateUserController
);

router.delete(
  '/users/:userId',
  auth,
  idValidator('userId'),
  checkValidation,
  deleteUserController
);

router.delete('/users', auth, deleteUserController);

export default router;
