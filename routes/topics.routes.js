import express from 'express';

import auth from '../middlewares/auth.js';

import {
  createTopicController,
  getTopicsController,
  updateTopicController,
  deleteTopicController,
} from '../controllers/topics.controllers.js';

const router = express.Router();

router.get('/topics/:topicId', getTopicsController);

router.get('/topics', getTopicsController);

router.post('/topics', auth, createTopicController);

router.patch('/topics/:topicId', auth, updateTopicController);

router.patch('/topics', auth, updateTopicController);

router.delete('/topics/:topicId', auth, deleteTopicController);

router.delete('/topics', auth, deleteTopicController);

export default router;
