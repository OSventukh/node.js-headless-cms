import { Op } from 'sequelize';
import HttpError from '../utils/http-error.js';

import {
  createService,
  deleteService,
  getService,
  updateService,
} from '../services/services.js';

import db from '../models/index.js';

const { Page } = db;

export const createPage = async (req, res, next) => {
  try {
    await createService(Page, req.body);
    res.status(201).json({
      message: 'Page successfully created',
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const getPages = async (req, res, next) => {
  // Receive page id from url params or query
  const id = req.params.pageId || req.query.id;

  // Receive other parameters from url query
  const { title, slug, status } = req.query;

  // If parameters was provided add it to object which will be passed as where query to sequelize
  const whereOptions = {
    ...(id && { id }),
    ...(title && { title }),
    ...(slug && { slug }),
    ...(status && { status }),
  };

  try {
    // get topics with provided parameters and response it to the client
    const pages = await getService(Page, whereOptions);
    res.status(200).json({
      pages,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const updatePage = async (req, res, next) => {
  // Receive page id from url params or request body
  const pageId = req.params.pageId || req.body.id;

  // Divide the request body into data that will be updated and page id
  // Page id should reamin unchanged
  const { id, ...toUpdate } = req.body;

  try {
    // Check if page or pages with provided id are exists
    const pages = await getService(Page, { id: pageId });
    if (!pages || pages.length === 0) {
      throw new HttpError('This pages does not exist', 404);
    }

    // Update existion page
    await updateService(Page, toUpdate, { id: pageId });

    res.status(200).json({
      message: 'Page successfully updated',
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const deletePage = async (req, res, next) => {
  // Receive page id from url param or request body
  let pageId = req.params.pageId || req.body.id;

  // Transform page id to array if it is not
  if (pageId && !Array.isArray(pageId)) {
    pageId = [pageId];
  }

  try {
    // Check if page or page with provided id are exist
    const pages = await getService(Page, {
      id: { [Op.in]: pageId },
    });

    if (!pages || pages.length === 0) {
      throw new HttpError('This page does not exist', 404);
    }

    Promise.all(
      pageId.map(async (id) => {
        await deleteService(Page, { id });
      }),
    );
    res.status(200).json({
      message: 'Page was successfully deleted',
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};
