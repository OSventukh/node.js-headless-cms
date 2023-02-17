import express from 'express';

import {
  createPage,
  getPages,
  updatePage,
  deletePage,
} from '../controllers/page.controllers.js';

const router = express.Router();

router.get('/pages/:pageId', getPages);

router.get('/pages', getPages);

router.post('/pages', createPage);

router.patch('/pages/:pageId', updatePage);

router.patch('/pages', updatePage);

router.delete('/pages/:pageId', deletePage);

router.delete('/pages', deletePage);

export default router;
