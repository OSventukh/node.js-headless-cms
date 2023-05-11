import { Op } from 'sequelize';
import { User, Topic, Role, sequelize } from '../models/index.js';
import HttpError from '../utils/http-error.js';
import {
  checkIncludes,
  checkAttributes,
  buildWhereObject,
  getOrder,
  getPagination,
} from '../utils/models.js';
import sendMail from '../utils/nodemailer.js';

import { ADMIN, SUPERADMIN } from '../utils/constants/roles.js';
import { ACTIVE, PENDING } from '../utils/constants/status.js';

export const createUser = async ({ topicId, roleId, ...data }, host) => {
  try {
    // Create user and find topic
    const topicIds = topicId ? Array.from(topicId) : [];
    const [topics, role] = await Promise.all([
      await Topic.findAll({
        where: {
          id: {
            [Op.in]: topicIds,
          },
        },
      }),
      await Role.findByPk(roleId),
    ]);

    if (!role) {
      throw new HttpError('Role not found', 404);
    }

    // Prevent creante another super admin
    if (role.name === SUPERADMIN) {
      throw new HttpError('This action is not allowed', 403);
    }

    const user = await sequelize.transaction(async (transaction) => {
      const createdUser = await User.create({ ...data, status: PENDING }, { transaction });
      await Promise.all([
        topics && topics.length > 0 && await createdUser.setTopics(topics, { transaction }),
        role && await createdUser.setRole(role, { transaction }),
      ]);
      return createdUser;
    });

    const info = await sendMail({
      to: user.email,
      subject: 'Confirm registration',
      body: `<body>
        <h1>VETHELTH</h1>
        <p>Dear, ${user.firstname}</p>
        <p>An administrator has created an account for you. To complete your registration and activate your account, please click on the link below</p>
        <div>
          <a href="${host}/confirm/${user.confirmationToken}">Click Here</a>
        </div>
      </body>`,
    });

    return user.getPublicData();
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      throw new HttpError(error.message, 400);
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new HttpError('User already exist', 409);
    }
    throw new HttpError(
      error.message || 'Something went wrong',
      error.statusCode || 500
    );
  }
};

export const getUsers = async (
  whereQuery,
  includeQuery,
  orderQuery,
  page,
  size,
  paranoid,
  columns,
) => {
  try {
    // Convert provided include query to array and check if it avaible for this model
    const avaibleIncludes = ['posts', 'pages', 'topics', 'role'];
    const include = checkIncludes(includeQuery, avaibleIncludes);

    // Check if provided query avaible for filtering this model
    const avaibleColumns = [
      'id',
      'firstname',
      'lastname',
      'email',
      'status',
      'createdAt',
      'updatedAt',
      'deletedAt',
    ];
    const whereObj = buildWhereObject(whereQuery, avaibleColumns);

    // exclude password
    const attributes = checkAttributes(columns, avaibleColumns, ['password']);
    // include Role association
    const order = await getOrder(orderQuery, User, [
      { model: 'Role', as: 'role', column: 'name' },
    ]);

    const { offset, limit } = getPagination(page, size);

    const result = await User.findAndCountAll({
      where: whereObj,
      ...(columns && { attributes: ['id', ...attributes] }),
      include,
      order,
      offset,
      limit,
      paranoid: !paranoid,
    });
    return result;
  } catch (error) {
    throw new HttpError(
      error.message || 'Something went wrong',
      error.statusCode || 500,
    );
  }
};

export const updateUser = async (id, { topicId, ...toUpdate }, authUser) => {
  try {
    const topicIds = topicId ? Array.from(topicId) : [];

    // Find user and topics in database
    const [user, topics] = await Promise.all([
      await User.findByPk(id, { include: ['role'] }),
      topicId && (await Topic.findAll({
        where: {
          id: {
            [Op.in]: topicIds,
          },
        },
      })),
    ]);

    if (!user) {
      throw new HttpError('User with this id not found', 404);
    }

    const roleToUpdate = await Role.findByPk(toUpdate.roleId);

    // Edit super admin user
    if (user.role.name === SUPERADMIN) {
      const currentUserRole = await authUser.getRole();

      // Only super admin can edit himself
      if (currentUserRole.name !== SUPERADMIN) {
        throw new HttpError('No access to perform this action', 403);
      }

      // Prevent changing role of super admin
      if (toUpdate.roleId && roleToUpdate.name !== SUPERADMIN) {
        throw new HttpError('Cannot change the role of a SUPERADMIN user', 403);
      }

      // Prevent changing status of super admin
      if (toUpdate.status && toUpdate.status !== ACTIVE) {
        throw new HttpError('Cannot change the status of a SUPERADMIN user', 403);
      }
    }

    // Prevent create another super admin
    if (user.role.name !== SUPERADMIN && roleToUpdate.name === SUPERADMIN) {
      throw new HttpError('This action is not allowed', 403);
    }

    // Update user, and set new assotiations with topics
    const [result] = await Promise.all([
      await User.update(toUpdate, {
        where: {
          id,
        },
      }),
      topicId && user.setTopics(topics),
    ]);

    if (result[0] === 0) {
      throw new HttpError('User was not updated', 400);
    }
  } catch (error) {
    throw new HttpError(
      error.message || 'Something went wrong',
      error.statusCode || 500
    );
  }
};

export const deleteUser = async (id) => {
  const usersId = Array.of(id).flat();

  try {
    const users = await User.findAll({
      where: {
        id: {
          [Op.in]: usersId
        },
      },
      include: ['role'],
    });
    if (!users || users.length === 0) {
      throw new HttpError('User not found', 404);
    }
    // Prevent deleting super admin
    users.forEach((user) => {
      if (user.id === 1 || user.role.name === SUPERADMIN) {
        throw new HttpError('This user cannot be deleted', 403);
      }
    });

    // Deleting the user
    const result = await User.destroy({
      where: {
        id: {
          [Op.in]: usersId,
        },
      },
    });

    if (result === 0) {
      throw new HttpError('User was not deleted', 400);
    }
  } catch (error) {
    throw new HttpError(
      error.message || 'Something went wrong',
      error.statusCode || 500
    );
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
    throw new HttpError(
      error.message || 'Something went wrong',
      error.statusCode || 500
    );
  }
};

export const getUserRoles = async () => {
  try {
    const roles = Role.findAll({
      attributes: ['id', 'name'],
      where: {
        name: {
          [Op.not]: SUPERADMIN,
        },
      },
    });
    return roles;
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};

export const getUserTopics = async (authUser) => {
  try {
    const authUserRole = await authUser.getRole();

    if (authUserRole.name === SUPERADMIN || authUserRole === ADMIN) {
      const allTopics = await Topic.findAll();
      return allTopics;
    }

    const userTopics = await authUser.getTopics();
    return userTopics;
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};
