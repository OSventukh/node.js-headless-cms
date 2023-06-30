import { Op } from 'sequelize';
import HttpError from '../utils/http-error.js';
import { Post } from '../models/index.js';

/* eslint-disable import/prefer-default-export */

export const searchController = async (req, res, next) => {
  try {
    const searchString = decodeURIComponent(req.params.searchString);
    if (!searchString || searchString.length === 0) {
      throw new HttpError('Search query should not be an empty', 400);
    }
    const result = await Post.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${searchString}%` } },
          { content: { [Op.like]: `%${searchString}%` } },
        ],
      },
      include: ['topics']
    });
    res.status(200).json({
      posts: result,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};
