import express from 'express';
import { addPost, getPost } from '../controllers/post.controllers.js';

const router = express.Router();

router.get('/post/:postId', getPost);

router.post('/posts', addPost);

export default router;
