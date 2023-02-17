import express from 'express';

import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} from '../controllers/user.controllers.js';

const router = express.Router();

router.get('/users/:userId', getUsers);

router.get('/users', getUsers);

router.post('/users', createUser);

router.patch('/users/:userId', updateUser);

router.patch('/users', updateUser);

router.delete('/users/:userId', deleteUser);

router.delete('/users', deleteUser);

export default router;
