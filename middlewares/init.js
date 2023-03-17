import { Role } from '../models';
import HttpError from '../utils/http-error.js';

export default async function(req, res, next) {
  try {
    const roles = await Role.findAll();
    if (roles.length > 0) {
      return next();
    }
    await Role.bulkCreate([
      { name: 'administrator' },
      { name: 'moderator' },
      { name: 'writer' },
    ]);
    next();
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};
