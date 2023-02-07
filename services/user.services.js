import db from '../models/index.js';

export const createUserService = async (
  firstname,
  lastname,
  email,
  password,
  role,
) => {
  try {
    const { User } = await db();
    const user = await User.create({
      firstname,
      lastname,
      email,
      password,
      role,
    });
    return user;
  } catch (error) {
    throw new Error('Could not create new user');
  }
};

export const getUsersService = async (
  whereOptions = {},
  includeOptions = [],
  orderOptions = [],
) => {
  try {
    const { User } = await db();
    const users = await User.findAll({
      where: whereOptions,
      include: includeOptions,
      order: orderOptions,
    });
    return users;
  } catch (error) {
    throw new Error('Could not find users');
  }
};

export const deleteUserService = async (whereOptions) => {
  try {
    const { User } = await db();
    await User.destroy({
      where: whereOptions,
    });
  } catch (error) {
    throw new Error('Could not delete this user');
  }
};
