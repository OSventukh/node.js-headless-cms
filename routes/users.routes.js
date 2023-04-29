import express from 'express';

import { auth, rolesAccess } from '../middlewares/auth.js';

import {
  createUserController,
  getUsersController,
  updateUserController,
  deleteUserController,
  getUserRolesController,
} from '../controllers/users.controllers.js';

import {
  userValidator,
  idValidator,
  paginationValidator,
} from '../utils/validators.js';
import checkValidation from '../middlewares/validation.js';
import { ADMIN } from '../utils/constants/roles.js';

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
  rolesAccess([ADMIN]),
  userValidator(),
  checkValidation,
  createUserController
);

router.patch(
  '/users/:userId',
  auth,
  rolesAccess([ADMIN]),
  userValidator(),
  idValidator('userId'),
  checkValidation,
  updateUserController
);

router.patch(
  '/users',
  auth,
  rolesAccess([ADMIN]),
  userValidator(),
  checkValidation,
  updateUserController
);

router.delete(
  '/users/:userId',
  auth,
  rolesAccess([ADMIN]),
  idValidator('userId'),
  checkValidation,
  deleteUserController,
);

router.delete('/users', auth, rolesAccess([ADMIN]), deleteUserController);

router.get('/roles', auth, rolesAccess([ADMIN]), getUserRolesController);

export default router;
