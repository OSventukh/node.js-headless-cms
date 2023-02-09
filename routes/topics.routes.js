import express from 'express';

import {
  createTopic,
  getTopics,
  updateTopic,
  deleteTopic,
} from '../controllers/topic.controllers';

const router = express.Router();

router.get('/topics/:topicId', getTopics);

router.get('/topics', getTopics);

router.post('/topic', createTopic);

router.patch('/topic', updateTopic);

router.delete('/topic/:topicId', deleteTopic);

router.delete('/topic', deleteTopic);

export default router;
