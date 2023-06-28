import { Op } from 'sequelize';
import HttpError from '../utils/http-error.js';
import { getPosts } from '../services/posts.services.js';
import { Post } from '../models/index.js';

/* eslint-disable import/prefer-default-export */

export const searchController = async (req, res, next) => {
  try {
    const searchString = decodeURIComponent(req.params.searchString);
    // const { include, order, page, size, columns } = req.query;

    // const { count, rows } = await getPosts(
    //   {
    //     [Op.or]: [{ title: searchString }, { content: searchString }],
    //   },
    //   include,
    //   order,
    //   columns,
    //   page,
    //   size,
    // );
    const result = await Post.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${searchString}%` } },
          { content: { [Op.like]: `%${searchString}%` } },
        ],
      },
    });
    res.status(200).json({
      posts: result,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};
