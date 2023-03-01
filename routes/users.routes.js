import express from 'express';

import {
  createUserController,
  getUsersController,
  updateUserController,
  deleteUserController,
} from '../controllers/users.controllers.js';

const router = express.Router();

router.get('/users/:userId', getUsersController);

router.get('/users', getUsersController);

router.post('/users', createUserController);

router.patch('/users/:userId', updateUserController);

router.patch('/users', updateUserController);

router.delete('/users/:userId', deleteUserController);

router.delete('/users', deleteUserController);

export default router;
