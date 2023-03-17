import { User } from '../models/index.js';
import { hashPassword } from '../utils/hash.js';
import HttpError from '../utils/http-error.js';
import { checkIncludes, buildWhereObject, getOrder, getPagination } from '../utils/models.js';

export const createUser = async (data) => {
  try {
    const userData = {
      ...data,
      password: await hashPassword(data.password),
    };
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
};

export const getUsers = async (
  whereQuery,
  includeQuery,
  orderQuery,
  page,
  size,
) => {
  try {
    // Convert provided include query to array and check if it avaible for this model
    const avaibleIncludes = ['posts', 'pages', 'topics'];
    const include = checkIncludes(includeQuery, avaibleIncludes);

    // Check if provided query avaible for filtering this model
    const avaibleWheres = ['id', 'firstname', 'lastName', 'email', 'role', 'status'];
    const whereObj = buildWhereObject(whereQuery, avaibleWheres);

    const order = await getOrder(orderQuery, User);

    const { offset, limit } = getPagination(page, size);

    const result = await User.findAndCountAll({
      where: whereObj,
      attributes: { exclude: ['password'] },
      include,
      order,
      offset,
      limit,
    });

    return result;
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};

export const updateUser = async (id, toUpdate) => {
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
};

export const deleteUser = async (id) => {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      throw new HttpError('User not found', 404);
    }
    // Prevent deleting administrator
    if (user.id === 1 || user.role === 'admin') {
      throw new HttpError('This user cannot be deleted', 403);
    }

    // Deleting a user is not permanent, a user can be restored
    const result = await User.update(
      {
        status: 'deleted',
      },
      {
        where: {
          id,
        },
      },
    );
    if (result[0] === 0) {
      throw new HttpError('User was not deleted', 400);
    }
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};
