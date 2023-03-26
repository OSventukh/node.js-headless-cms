import { Op } from 'sequelize';
import { User, Topic } from '../models/index.js';
import { hashPassword } from '../utils/hash.js';
import HttpError from '../utils/http-error.js';
import { checkIncludes, buildWhereObject, getOrder, getPagination } from '../utils/models.js';
import { ADMIN } from '../utils/constants/roles.js';

export const createUser = async ({ topicId, ...data }) => {
  try {
    const userData = {
      ...data,
      password: await hashPassword(data.password),
    };

    // Create user and find topic
    const topicIds = topicId ? Array.from(topicId) : [];
    const [user, topics] = await Promise.all([
      await User.create(userData),
      await Topic.findAll({
        where: {
          id: {
            [Op.in]: topicIds,
          },
        },
      }),
    ]);

    // if topic exist set it to created user
    if (topics) {
      await user.setTopics(topics);
    }
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
  paranoid,
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
      paranoid: !paranoid,
    });

    return result;
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};

export const updateUser = async (id, { topicId, ...toUpdate }) => {
  try {
    const topicIds = topicId ? Array.from(topicId) : [];

    // Find user and topics in database
    const [user, topics] = await Promise.all([
      await User.findByPk(id),
      await Topic.findAll({
        where: {
          [Op.in]: topicIds,
        },
      }),
    ]);

    if (!user) {
      throw new HttpError('User with this id not found', 404);
    }

    // Update user, and set new assotiations with topics
    const [result] = await Promise.all([
      await User.update(toUpdate, {
        where: {
          id,
        },
      }),
      user.setTopics(topics),
    ]);

    if (result[0] === 0) {
      throw new HttpError('User was not updated', 400);
    }
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};

export const deleteUser = async (id) => {
  try {
    const user = await User.findByPk(id, { include: ['role'] });
    if (!user) {
      throw new HttpError('User not found', 404);
    }
    // Prevent deleting administrator
    if (user.id === 1 || user.role.name === ADMIN) {
      throw new HttpError('This user cannot be deleted', 403);
    }

    // Deleting the user
    const result = await User.destroy({
      where: {
        id,
      },
    });

    if (result === 0) {
      throw new HttpError('User was not deleted', 400);
    }
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};

export const restoreUser = async (id) => {
  try {
    await User.restore({
      where: {
        id,
      },
    });
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};
