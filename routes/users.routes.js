import express from 'express';

import auth from '../middlewares/auth.js';

import {
  createUserController,
  getUsersController,
  updateUserController,
  deleteUserController,
} from '../controllers/users.controllers.js';

const router = express.Router();

router.get('/users/:userId', getUsersController);

router.get('/users', getUsersController);

router.post('/users', auth, createUserController);

router.patch('/users/:userId', auth, updateUserController);

router.patch('/users', auth, updateUserController);

router.delete('/users/:userId', auth, deleteUserController);

router.delete('/users', auth, deleteUserController);

export default router;
