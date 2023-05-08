import HttpError from '../utils/http-error.js';

import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  getUserRoles,
  getUserTopics,
} from '../services/users.services.js';

export const createUserController = async (req, res, next) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json({
      message: 'User successfully created',
      user,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const getUsersController = async (req, res, next) => {
  // receive user id from url params or query
  const id = req.params.userId || req.query.id;
  const { include, order, page, size, all, columns, ...whereQuery } = req.query;
  try {
    // getting users with provided paramaters and response it to the client
    const { count, rows } = await getUsers(
      {
        id,
        ...whereQuery,
      },
      include,
      order,
      page,
      size,
      all,
      columns,
    );
    res.status(200).json({
      count,
      currentPage: page,
      totalPages: Math.ceil(count / size),
      users: rows,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const updateUserController = async (req, res, next) => {
  // Receive user id from url params or request body
  const userId = req.params.userId || req.body.id;

  // Divide the request body into data that will be updated and user id if it was passed.
  // Id should remain unchanged
  const { id, ...toUpdate } = req.body;

  try {
    await updateUser(userId, toUpdate, req.authUser);
    res.status(200).json({
      message: 'User was successfully updated',
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const deleteUserController = async (req, res, next) => {
  // receive user id from url params or request body
  const userId = req.params.userId || req.body.id;

  try {
    // deleting all users with given id
    await deleteUser(userId);

    res.status(200).json({
      message: 'User was successfully deleted',
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const getUserRolesController = async (req, res, next) => {
  try {
    const roles = await getUserRoles();
    res.status(200).json({
      roles,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const getUserTopicsController = async (req, res, next) => {
  try {
    const topics = await getUserTopics(req.authUser);
    res.status(200).json({
      topics,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};
