import express from 'express';
import { addPost, getPost, getAllPosts, deletePost } from '../controllers/post.controllers.js';

const router = express.Router();

router.get('/posts', getAllPosts);

router.get('/post/:postId', getPost);

router.post('/posts', addPost);

router.delete('/posts', deletePost);

export default router;
