import {
  createUserService,
  getUsersService,
  deleteUserService,
} from '../services/user.services.js';

export const createUser = async (req, res, next) => {
  const { firstname, lastname, email, password } = req.body;

  try {
    const user = await createUserService(firstname, lastname, email, password);
    res.status(201).json({
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Could not create new user',
    });
  }
};

export const getUsers = async (req, res, next) => {
  const { userId } = req.params;
  const { id, username, lastname, email, role } = req.query;
  let whereOptions;

  if (userId) {
    whereOptions = {
      id: userId,
    };
  }

  if (id || username || lastname || email || role) {
    whereOptions = {
      ...(id && { id }),
      ...(username && { username }),
      ...(lastname && { lastname }),
      ...(email && { email }),
      ...(role && { role }),
    };
  }

  try {
    const users = await getUsersService(whereOptions);
    res.status(200).json({
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Could not find user(s)',
    });
  }
};

export const deleteUser = async (req, res, next) => {
  const { userIds } = req.body;

  try {
    Promise.all(
      userIds.map(async (id) => {
        await deleteUserService({ id });
      }),
    );
    res.status(200).json({
      message: 'User was successfully deleted',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Could not delete user(s)',
    });
  }
};
