import express from 'express';

import auth from '../middlewares/auth.js';

import {
  createTopicController,
  getTopicsController,
  updateTopicController,
  deleteTopicController,
} from '../controllers/topics.controllers.js';

import { topicValidator, idValidator, paginationValidator } from '../utils/validators.js';
import checkValidation from '../middlewares/validation.js';

const router = express.Router();

router.get('/topics/:topicId', idValidator('topicId'), paginationValidator(), checkValidation, getTopicsController);

router.get('/topics', paginationValidator(), checkValidation, getTopicsController);

router.post('/topics', auth, topicValidator(), checkValidation, createTopicController);

router.patch('/topics/:topicId', auth, topicValidator(), idValidator('topicId'), checkValidation, updateTopicController);

router.patch('/topics', auth, topicValidator(), checkValidation, updateTopicController);

router.delete('/topics/:topicId', auth, idValidator('topicId'), checkValidation, deleteTopicController);

router.delete('/topics', auth, deleteTopicController);

export default router;
