import express from 'express';

import {
  createTopicController,
  getTopicsController,
  updateTopicController,
  deleteTopicController,
} from '../controllers/topics.controllers.js';

const router = express.Router();

router.get('/topics/:topicId', getTopicsController);

router.get('/topics', getTopicsController);

router.post('/topics', createTopicController);

router.patch('/topics/:topicId', updateTopicController);

router.patch('/topics', updateTopicController);

router.delete('/topics/:topicId', deleteTopicController);

router.delete('/topics', deleteTopicController);

export default router;
