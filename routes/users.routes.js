import express from 'express';

import { auth, rolesAccess } from '../middlewares/auth.js';

import {
  createUserController,
  getUsersController,
  updateUserController,
  deleteUserController,
  getUserRolesController,
  getUserTopicsController,
} from '../controllers/users.controllers.js';

import {
  userValidator,
  paginationValidator,
} from '../utils/validators.js';
import checkValidation from '../middlewares/validation.js';
import { SUPERADMIN, ADMIN } from '../utils/constants/users.js';

const router = express.Router();

router.get(
  '/users/:userId',
  auth,
  paginationValidator(),
  checkValidation,
  getUsersController,
);

router.get(
  '/users',
  auth,
  paginationValidator(),
  checkValidation,
  getUsersController,
);

router.post(
  '/users',
  auth,
  rolesAccess([SUPERADMIN, ADMIN]),
  userValidator(),
  checkValidation,
  createUserController,
);

router.patch(
  '/users/:userId',
  auth,
  rolesAccess([SUPERADMIN, ADMIN]),
  userValidator(),
  checkValidation,
  updateUserController,
);

router.patch(
  '/users',
  auth,
  rolesAccess([SUPERADMIN, ADMIN]),
  userValidator(),
  checkValidation,
  updateUserController,
);

router.delete(
  '/users/:userId',
  auth,
  rolesAccess([SUPERADMIN, ADMIN]),
  checkValidation,
  deleteUserController,
);

router.delete('/users', auth, rolesAccess([SUPERADMIN, ADMIN]), deleteUserController);

router.get('/roles', auth, getUserRolesController);

router.get('/usertopics', auth, getUserTopicsController);

export default router;
