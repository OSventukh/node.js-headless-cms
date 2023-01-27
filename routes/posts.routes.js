import express from 'express';
import { addPost } from '../controllers/post.controllers.js';

const router = express.Router();

router.post('/posts', addPost);

export default router;
