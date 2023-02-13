import express from 'express';

import {
  createTopic,
  getTopics,
  updateTopic,
  deleteTopic,
} from '../controllers/topic.controllers.js';

const router = express.Router();

router.get('/topics/:topicId', getTopics);

router.get('/topics', getTopics);

router.post('/topics', createTopic);

router.patch('/topics/:topicId', updateTopic);

router.patch('/topics', updateTopic);

router.delete('/topics/:topicId', deleteTopic);

router.delete('/topics', deleteTopic);

export default router;
