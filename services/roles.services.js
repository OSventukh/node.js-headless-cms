/* eslint-disable import/prefer-default-export */
import { Role } from '../models/index.js';
import HttpError from '../utils/http-error.js';

export const createRoles = async () => {
  try {
    const roles = await Role.findAll();
    if (roles.length === 0) {
      await Role.bulkCreate([
        { name: 'Administrator' },
        { name: 'Moderator' },
        { name: 'Writer' },
      ]);
    }
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};
