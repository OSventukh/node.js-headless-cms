import express from 'express';

import {
  createUser,
  getUsers,
  deleteUser,
} from '../controllers/user.controllers.js';

const router = express.Router();

router.post('/users', createUser);

router.get('/users/:userId', getUsers);

router.get('/users', getUsers);

router.delete('/users', deleteUser);

export default router;
