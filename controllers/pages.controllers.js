import HttpError from '../utils/http-error.js';

import {
  createPage,
  getPages,
  updatePage,
  deletePage,
} from '../services/pages.services.js';

export const createPageController = async (req, res, next) => {
  try {
    const page = await createPage(req.body);
    res.status(201).json({
      message: 'Page successfully created',
      page,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const getPagesController = async (req, res, next) => {
  // Receive page id from url params or query
  const id = req.params.pageId || req.query.id;

  const { include, order, page, size, columns, ...whereQuery } = req.query;

  try {
    // get topics with provided parameters and response it to the client
    const { count, rows } = await getPages(
      {
        id,
        ...whereQuery,
      },
      include,
      order,
      page,
      size,
      columns,
    );
    res.status(200).json({
      count,
      currentPage: page,
      totalPages: Math.ceil(count / size),
      pages: rows,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const updatePageController = async (req, res, next) => {
  // Receive page id from url params or request body
  const pageId = req.params.pageId || req.body.id;

  // Divide the request body into data that will be updated and page id
  // Page id should reamin unchanged
  const { id, ...toUpdate } = req.body;

  try {
    await updatePage(pageId, toUpdate);

    res.status(200).json({
      message: 'Page was successfully updated',
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const deletePageController = async (req, res, next) => {
  // Receive page id from url param or request body
  const pageId = req.params.pageId || req.body.id;

  try {
    // deleting all pages with given id
    const result = await deletePage(pageId);

    res.status(200).json({
      message: result > 1 ? 'Pages were successfully deleted' : 'Page was successfully deleted',
      count: result,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};
