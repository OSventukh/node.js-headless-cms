import { Op } from 'sequelize';
import db from '../models/index.js';
import HttpError from '../utils/http-error.js';

const { Page } = db;

export const createPage = async (pageData) => {
  try {
    const page = await Page.create(pageData);
    return page;
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      throw new HttpError(error.message, 400);
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      const fieldName = Object.entries(error.fields)[0][0];
      const fieldValue = Object.entries(error.fields)[0][1];
      const errorMessage = `The ${fieldName} should be an unique. Value ${fieldValue} is already in use`;
      throw new HttpError(errorMessage, 409);
    }
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};

export const getPages = async (
  whereQuery = {},
  includeQuery,
  orderQuery,
  offset,
  limit,
) => {
  try {
    // If parameter was provided, add it to sequelize where query
    const { id, title, slug, status } = whereQuery;
    const result = await Page.findAndCountAll({
      where: {
        ...(id && { id }),
        ...(title && { title }),
        ...(slug && { slug }),
        ...(status && { status }),
      },
      include: [],
      order: [],
      offset,
      limit,
    });
    return result;
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};

export const updatePage = async (id, toUpdate) => {
  try {
    const page = await Page.findByPk(id);
    if (!page) {
      throw new HttpError('Page with this id not found', 404);
    }

    const result = await Page.update(toUpdate, {
      where: {
        id,
      },
    });
    if (result[0] === 0) {
      throw new HttpError('Page was not updated', 400);
    }
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};

export const deletePage = async (id) => {
  try {
    const pagesId = Array.of(id).flat();

    const page = await Page.findAll({
      where: {
        id: {
          [Op.in]: pagesId,
        },
      },
    });

    if (!page || page.length === 0) {
      const errorMessage = pagesId.length > 1 ? 'Pages not found' : 'Page not found';
      throw new HttpError(errorMessage, 404);
    }

    const result = await Page.destroy({
      where: {
        id: {
          [Op.in]: pagesId,
        },
      },
    });

    if (result === 0) {
      throw new HttpError('Page was not deleted', 400);
    }

    return result;
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};
