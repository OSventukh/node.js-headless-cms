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
  idValidator,
  paginationValidator,
} from '../utils/validators.js';
import checkValidation from '../middlewares/validation.js';
import { SUPERADMIN, ADMIN } from '../utils/constants/roles.js';

const router = express.Router();

router.get(
  '/users/:userId',
  idValidator('userId'),
  paginationValidator(),
  checkValidation,
  getUsersController,
);

router.get(
  '/users',
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
  idValidator('userId'),
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
  idValidator('userId'),
  checkValidation,
  deleteUserController,
);

router.delete('/users', auth, rolesAccess([SUPERADMIN, ADMIN]), deleteUserController);

router.get('/roles', auth, rolesAccess([SUPERADMIN, ADMIN]), getUserRolesController);

router.get('/usertopics', auth, getUserTopicsController);

export default router;
