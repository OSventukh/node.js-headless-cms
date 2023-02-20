import { Op } from 'sequelize';
import db from '../models/index.js';
import { hashPassword } from '../utils/hash.js';
import HttpError from '../utils/http-error.js';

const { User } = db;

export default {
  createUser: async (data) => {
    const userData = {
      ...data,
      password: await hashPassword(data.password),
    };
    try {
      const user = await User.create(userData);
      return user;
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        throw new HttpError(error.message, 400);
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new HttpError('User already exist', 409);
      }
      throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
    }
  },
  getUsers: async (whereQuery, includeQuery, orderQuery, offset, limit) => {
    try {
      // If parameter was provided, add it to sequelize where query
      const { id, firstname, lastname, email, role } = whereQuery;
      const result = await User.findAndCountAll({
        where: {
          ...(id && { id }),
          ...(firstname && { lastname }),
          ...(lastname && { lastname }),
          ...(email && { email }),
          ...(role && { role }),
        },
        include: [],
        order: [],
      });

      return result;
    } catch (error) {
      throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
    }
  },
  updateUser: async (id, toUpdate) => {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new HttpError('User with this id not found', 404);
      }

      const result = await User.update(toUpdate, {
        where: {
          id,
        },
      });
      if (result[0] === 0) {
        throw new HttpError('User was not updated', 400);
      }
    } catch (error) {
      throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
    }
  },
  deleteUser: async (id) => {
    try {
      const users = await User.findAll({
        where: {
          id: {
            [Op.in]: id,
          },
        },
      });

      if (!users || users.length === 0) {
        const errorMessage = id.length > 1 ? 'Users not found' : 'User not found';
        throw new HttpError(errorMessage, 404);
      }

      const result = await User.destroy({
        where: {
          id: {
            [Op.in]: id,
          },
        },
      });
      return result;
    } catch (error) {
      throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
    }
  },
};
