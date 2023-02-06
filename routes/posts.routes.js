import express from 'express';
import { addPost, getPosts, deletePost } from '../controllers/post.controllers.js';

const router = express.Router();

router.get('/posts/:postId', getPosts);

router.get('/posts', getPosts);

router.post('/posts', addPost);

router.delete('/posts', deletePost);

export default router;
