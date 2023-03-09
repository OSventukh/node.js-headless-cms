import express from 'express';

import auth from '../middlewares/auth.js';

import {
  createPageController,
  getPagesController,
  updatePageController,
  deletePageController,
} from '../controllers/pages.controllers.js';

const router = express.Router();

router.get('/pages/:pageId', getPagesController);

router.get('/pages', getPagesController);

router.post('/pages', auth, createPageController);

router.patch('/pages/:pageId', auth, updatePageController);

router.patch('/pages', auth, updatePageController);

router.delete('/pages/:pageId', auth, deletePageController);

router.delete('/pages', auth, deletePageController);

export default router;
