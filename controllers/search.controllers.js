import { Op } from 'sequelize';
import HttpError from '../utils/http-error.js';
import { Post } from '../models/index.js';
import { getPagination } from '../utils/models.js';

/* eslint-disable import/prefer-default-export */

export const searchController = async (req, res, next) => {
  try {
  const { page, size } = req.query;

    const { offset, limit } = getPagination(page, size);

    const searchString = decodeURIComponent(req.params.searchString);
    if (!searchString || searchString.length === 0) {
      throw new HttpError('Search query should not be an empty', 400);
    }
    const { count, rows} = await Post.findAndCountAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${searchString}%` } },
          { content: { [Op.like]: `%${searchString}%` } },
        ],
      },
      include: ['topics'],
      offset,
      limit,
      distinct: true
    });

    res.status(200).json({
      count,
      currentPage: +page,
      totalPages: Math.ceil(count / size),
      posts: rows,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};
