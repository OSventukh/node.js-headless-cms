import express from 'express';

import {
  createPageController,
  getPagesController,
  updatePageController,
  deletePageController,
} from '../controllers/page.controllers.js';

const router = express.Router();

router.get('/pages/:pageId', getPagesController);

router.get('/pages', getPagesController);

router.post('/pages', createPageController);

router.patch('/pages/:pageId', updatePageController);

router.patch('/pages', updatePageController);

router.delete('/pages/:pageId', deletePageController);

router.delete('/pages', deletePageController);

export default router;
