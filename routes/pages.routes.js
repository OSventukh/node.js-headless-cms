import express from 'express';

import auth from '../middlewares/auth.js';

import {
  createPageController,
  getPagesController,
  updatePageController,
  deletePageController,
} from '../controllers/pages.controllers.js';

import { pageValidator, idValidator, paginationValidator } from '../utils/validators.js';
import checkValidation from '../middlewares/validation.js';

const router = express.Router();

router.get('/pages/:pageId', idValidator('pageId'), paginationValidator(), checkValidation, getPagesController);

router.get('/pages', paginationValidator(), checkValidation, getPagesController);

router.post('/pages', auth, pageValidator(), checkValidation, createPageController);

router.patch('/pages/:pageId', auth, idValidator('pageId'), checkValidation, updatePageController);

router.patch('/pages', auth, pageValidator(), checkValidation, updatePageController);

router.delete('/pages/:pageId', auth, idValidator('pageId'), checkValidation, deletePageController);

router.delete('/pages', auth, deletePageController);

export default router;
