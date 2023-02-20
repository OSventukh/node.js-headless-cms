import { Op } from 'sequelize';
import HttpError from '../utils/http-error.js';

import {
  createService,
  getService,
  updateService,
  deleteService,
} from '../services/services.js';
import userServices from '../services/user.service.js';
import db from '../models/index.js';

const { User } = db;

export const createUser = async (req, res, next) => {
  try {
    const user = await userServices.createUser(req.body);
    res.status(201).json({
      message: 'User successfully created',
      user,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const getUsers = async (req, res, next) => {
  // receive user id from url params or query
  const id = req.params.userId || req.query.id;
  // receive other parameters from url query
  const { firstname, lastname, email, role } = req.query;

  try {
    // getting users with provided paramaters and response it to the client
    const { count, rows } = await userServices.getUsers({
      id,
      firstname,
      lastname,
      email,
      role,
    });
    res.status(200).json({
      count,
      users: rows,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const updateUser = async (req, res, next) => {
  // Receive user id from url params or request body
  const userId = req.params.userId || req.body.id;

  // Divide the request body into data that will be updated and user id if it was passed.
  // Id should remain unchanged
  const { id, ...toUpdate } = req.body;

  try {
    // Check if user or users with provided id are exists
    await userServices.updateUser(userId, toUpdate);
    res.status(200).json({
      message: 'User was successfully updated',
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const deleteUser = async (req, res, next) => {
  // receive user id from url params or request body
  let userId = req.params.userId || req.body.id;

  // transform user id to array if it is not
  if (userId && !Array.isArray(userId)) {
    userId = [userId];
  }
  try {
    // deleting all users with given id
    const result = await userServices.deleteUser(userId);

    res.status(200).json({
      message: result > 1 ? 'Users were successfully deleted' : 'User was successfully deleted',
      count: result,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};
