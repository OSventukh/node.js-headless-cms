import express from 'express';
import { addPost, getPosts, updatePost, deletePost } from '../controllers/post.controllers.js';

const router = express.Router();

router.get('/posts/:postId', getPosts);

router.get('/posts', getPosts);

router.post('/posts', addPost);

router.patch('/posts/:postId', updatePost);

router.patch('/posts', updatePost);

router.delete('/posts/:postId', deletePost);

router.delete('/posts', deletePost);

export default router;
