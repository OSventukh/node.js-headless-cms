import HttpError from '../utils/http-error.js';

import { createUser, getUsers, updateUser, deleteUser } from '../services/users.services.js';

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

  try {
    // getting users with provided paramaters and response it to the client
    const { count, rows } = await getUsers({
      id,
      ...req.query,
    });
    res.status(200).json({
      count,
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
    await updateUser(userId, toUpdate);
    res.status(200).json({
      message: 'User was successfully updated',
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const deleteUserController = async (req, res, next) => {
  // receive user id from url params or request body
  let userId = req.params.userId || req.body.id;

  // transform user id to array if it is not
  if (userId && !Array.isArray(userId)) {
    userId = [userId];
  }
  try {
    // deleting all users with given id
    const result = await deleteUser(userId);

    res.status(200).json({
      message: result > 1 ? 'Users were successfully deleted' : 'User was successfully deleted',
      count: result,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};
