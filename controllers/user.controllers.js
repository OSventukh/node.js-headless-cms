import { Op } from 'sequelize';

import {
  createService,
  getService,
  updateService,
  deleteService,
} from '../services/services.js';
import db from '../models/index.js';
import { hashPassword } from '../utils/hash.js';

const { User } = db;

export const createUser = async (req, res, next) => {
  // Hashing password
  try {
    const userData = {
      ...req.body,
      password: await hashPassword(req.body.password),
    };
    await createService(User, userData);
    res.status(201).json({
      message: 'User successfully created',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Could not create user',
    });
  }
};

export const getUsers = async (req, res, next) => {
  // receive user id from url params or query
  const id = req.params.userId || req.query.id;
  // receive other parameters from url query
  const { firstname, lastname, email, role } = req.query;

  // If parameter was provided add it to object which will be passed as where query to sequelize
  const whereOptions = {
    ...(id && { id }),
    ...(firstname && { lastname }),
    ...(lastname && { lastname }),
    ...(email && { email }),
    ...(role && { role }),
  };

  try {
    // getting users with provided paramaters and response it to the client
    const users = await getService(User, whereOptions);
    res.status(200).json({
      users,
    });
  } catch (error) {
    res.status(404).json({
      message: 'Could not find user(s)',
    });
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
    const user = await getService(User, { id: userId });

    if (!user || user.length === 0) {
      throw new Error('This user does not exist');
    }

    // update existing user
    await updateService(User, toUpdate, { id: userId });

    res.status(200).json({
      message: 'User was successfully updated',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Could not update this user',
    });
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
    // Checking if user or users with passed id(s) is exists
    const users = await getService(User, {
      id: { [Op.in]: userId },
    });

    if (!users || users.length === 0) {
      throw new Error('This user does not exist');
    }
    // deleting all users with given id
    Promise.all(
      userId.map(async (id) => {
        await deleteService(User, { id });
      })
    );
    res.status(200).json({
      message: 'User was succesfully deleted',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Could not delete user',
    });
  }
};
