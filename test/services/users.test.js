import { describe, it, vi, expect, beforeAll, afterEach, afterAll } from 'vitest';
import db from '../../models/index.js';
import HttpError from '../../utils/http-error.js';

const { sequelize } = db;

describe('Users serviсes', async () => {
  let createUser = null;
  let updateUser = null;
  let getUsers = null;
  let deleteUser = null;
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    await sequelize.truncate();
    // import services after sequelize run
    const usersServices = await import('../../services/users.services.js');
    createUser = usersServices.createUser;
    updateUser = usersServices.updateUser;
    getUsers = usersServices.getUsers;
    deleteUser = usersServices.deleteUser;
  });

  afterEach(async () => {
    await sequelize.truncate();
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('createUser', () => {
    it('Should create a new user', async () => {
      const userData = {
        firstname: 'Test',
        lastname: 'User',
        email: 'test@test.com',
        password: '123456',
      };
      const user = await createUser(userData);

      expect(user.firstname).toBe(userData.firstname);
      expect(user.lastname).toBe(userData.lastname);
      expect(user.email).toBe(userData.email);
    });

    it('Should throw an error if validation failed', async () => {
      const userData = {
        firstname: '',
        lastname: 'User',
        email: 'test@test.com',
        password: '123456',
      };
      await expect(createUser(userData)).rejects.toThrow(HttpError);
    });

    it('should throw a 400 error if validation fails', async () => {
      const userData = {
        firstname: '',
        lastname: 'User',
        email: 'test@test.com',
        password: '123456',
      };
      expect.assertions(1);
      try {
        await createUser(userData);
      } catch (error) {
        expect(error.statusCode).toBe(400);
      }
    });

    it('should throw a message error "User already exist" and statusCode 409 if user with the same email exist', async () => {
      const userData1 = {
        firstname: 'Test',
        lastname: 'User',
        email: 'test@test.com',
        password: '123456',
      };
      const userData2 = {
        firstname: 'Test',
        lastname: 'User',
        email: 'test@test.com',
        password: '123456',
      };

      expect.assertions(2);
      await createUser(userData1);
      try {
        await createUser(userData2);
      } catch (error) {
        expect(error.message).toBe('User already exist');
        expect(error.statusCode).toBe(409);
      }
    });
  });

  describe('getUsers', () => {
    it('Should return all users', async () => {
      const userData1 = {
        firstname: 'Test',
        lastname: 'User',
        email: 'test@test.com',
        password: '123456',
      };
      const userData2 = {
        firstname: 'Test 2',
        lastname: 'User',
        email: 'test2@test.com',
        password: '123456',
      };

      await createUser(userData1);
      await createUser(userData2);

      const result = await getUsers();
      expect(result.count).toBe(2);
      expect(result.rows.length).toBe(2);
    });

    it('Should return an array of users that match the query', async () => {
      const userData1 = {
        firstname: 'Test 1',
        lastname: 'User',
        email: 'test1@test.com',
        password: '123456',
        status: 'active',
      };
      const userData2 = {
        firstname: 'Test 2',
        lastname: 'User',
        email: 'test2@test.com',
        password: '123456',
        status: 'active',
      };
      const userData3 = {
        firstname: 'Test 3',
        lastname: 'User',
        email: 'test3@test.com',
        password: '123456',
        status: 'pending',
      };
      const { User } = db;

      await User.bulkCreate([userData1, userData2, userData3]);

      const result = await getUsers({ status: 'active' });
      expect(result.count).toBe(2);
      expect(result.rows.length).toBe(2);
      expect(result.rows[0].status).toBe('active');
      expect(result.rows[1].status).toBe('active');
    });

    it('Should throw an error with message that sequelize provide and status code 500 if sequelize failed', async () => {
      const { User } = db;
      vi.spyOn(User, 'findAndCountAll');
      const errorMessage = 'Could not get users';
      User.findAndCountAll.mockRejectedValueOnce(new Error(errorMessage));
      expect.assertions(2);
      try {
        await getUsers();
      } catch (error) {
        expect(error.message).toBe(errorMessage);
        expect(error.statusCode).toBe(500);
      }
    });

    it('Should throw an error with message "Something went wrong" and statusCode 500 if unknown error occurred', async () => {
      const { User } = db;
      vi.spyOn(User, 'findAndCountAll');
      User.findAndCountAll.mockRejectedValueOnce(new Error());
      expect.assertions(2);
      try {
        await getUsers();
      } catch (error) {
        expect(error.message).toBe('Something went wrong');
        expect(error.statusCode).toBe(500);
      }
    });
  });

  describe('updateUser', () => {
    it('Should update user successfully', async () => {
      const user = await createUser({
        firstname: 'Old Firstname',
        lastname: 'Old Lastname',
        email: 'old@test.com',
        password: '123456',
      });

      const toUpdate = { firstname: 'New FirstName', lastname: 'New Lastname', email: 'new@test.com' };
      await updateUser(user.id, toUpdate);
      const result = await getUsers({ id: user.id });
      expect(result.rows[0].firstname).toBe(toUpdate.firstname);
      expect(result.rows[0].lastname).toBe(toUpdate.lastname);
      expect(result.rows[0].email).toBe(toUpdate.email);
    });

    it('Should call User.fingByPk() and User.update functions with arguments', async () => {
      const { User } = db;
      vi.spyOn(User, 'findByPk');
      vi.spyOn(User, 'update');

      const mockUser = { id: 1, title: 'Old Title', description: 'Old Description' };
      User.findByPk.mockResolvedValue(mockUser);
      User.update.mockResolvedValue([1]);

      const updatedUser = { title: 'New Title', description: 'New Description' };
      await updateUser(mockUser.id, updatedUser);

      expect(User.findByPk).toHaveBeenCalledWith(mockUser.id);
      expect(User.update).toHaveBeenCalledWith(updatedUser, { where: { id: mockUser.id } });
    });

    it('Should throw an error if user to update is not found', async () => {
      const { User } = db;
      vi.spyOn(User, 'findByPk');

      User.findByPk.mockResolvedValue(null);
      await expect(updateUser(1, {})).rejects.toThrow();
      expect(User.findByPk).toHaveBeenCalledWith(1);
    });

    it('Sould throw an error with message "User with this id not found" and status code 404 if user to update is not found', async () => {
      const { User } = db;
      vi.spyOn(User, 'findByPk');
      User.findByPk.mockResolvedValue(null);
      expect.assertions(2);
      try {
        await updateUser(1, {});
      } catch (error) {
        expect(error.message).toBe('User with this id not found');
        expect(error.statusCode).toBe(404);
      }
    });

    it('Should throw an error with message "User was not updated" and status code 400 if user was not updated', async () => {
      expect.assertions(2);
      const { User } = db;
      vi.spyOn(User, 'findByPk');
      vi.spyOn(User, 'update');

      User.findByPk.mockResolvedValue({ id: 1 });
      User.update.mockResolvedValue([0]);

      try {
        await updateUser(1, {});
      } catch (error) {
        expect(error.message).toBe('User was not updated');
        expect(error.statusCode).toBe(400);
      }
    });

    it('Should throw an error that sequelize provide and status code 500 if sequelized failed', async () => {
      const { User } = db;
      vi.spyOn(User, 'findByPk');
      const errorMessage = 'Sequelize error';
      User.findByPk.mockRejectedValue(new Error(errorMessage));

      try {
        await updateUser(1, {});
      } catch (error) {
        expect(error.message).toBe(errorMessage);
        expect(error.statusCode).toBe(500);
      }
    });

    it('Sould throw an error with message "Something went wrong" and status code 500 if unknown error occured', async () => {
      const { User } = db;
      vi.spyOn(User, 'findByPk');
      User.findByPk.mockRejectedValue(new Error());

      try {
        await updateUser(1, {});
      } catch (error) {
        expect(error.message).toBe('Something went wrong');
        expect(error.statusCode).toBe(500);
      }
    });
  });

  describe('deleteUser', () => {
    it('Should delete user successfully', async () => {
      const { User } = db;
      User.findByPk.mockResore();
      const user = await createUser({
        firstname: 'Test',
        lastname: 'User',
        email: 'test@test.com',
        password: '123456',
      });
      expect(user).not.toBeNull();
      const result = await deleteUser(user.id);
      const users = await getUsers();
      expect(result).toBe(1);
      expect(users.count).toBe(0);
      expect(users.rows.length).toBe(0);
    });

    // it('Should delete multiple users successfully', async () => {
    //   const user1 = await createUser({
    //     title: 'Test User 1',
    //     slug: 'test-user-1',
    //     description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    //     image: 'test.jpg',
    //   });

    //   const user2 = await createUser({
    //     title: 'Test User 2',
    //     slug: 'test-user-2',
    //     description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    //     image: 'test.jpg',
    //   });
    //   const result = await deleteUser([user1.id, user2.id]);
    //   const users = await getUsers();
    //   expect(result).toBe(2);
    //   expect(users.count).toBe(0);
    //   expect(users.rows.length).toBe(0);
    // });

    it('Should throw an error with message "User not found" and statusCode 404 if user to delete not found', async () => {
      expect.assertions(4);

      try {
        await deleteUser(2);
      } catch (error) {
        expect(error.message).toBe('User not found');
        expect(error.statusCode).toBe(404);
      }

      try {
        await deleteUser([1, 2]);
      } catch (error) {
        expect(error.message).toBe('Users not found');
        expect(error.statusCode).toBe(404);
      }
    });

    it('Should throw an error with message "User was not deleted" and statusCode 400 if user was not deleted', async () => {
      expect.assertions(2);
      const { User } = db;

      const user = await createUser({
        firstname: 'Test',
        lastname: 'User',
        email: 'test@test.com',
        password: '123456',
      });

      vi.spyOn(User, 'destroy').mockResolvedValueOnce(0);

      try {
        await deleteUser(user.id);
      } catch (error) {
        expect(error.message).toBe('User was not deleted');
        expect(error.statusCode).toBe(400);
      }
    });

    it('Should throw an error with provided message and statusCode 500 if sequelize failed', async () => {
      const { User } = db;
      expect.assertions(2);
      const user = await createUser({
        firstname: 'Test',
        lastname: 'User',
        email: 'test@test.com',
        password: '123456',
      });
      const errorMessage = 'Sequelize error';
      vi.spyOn(User, 'update').mockRejectedValueOnce(new Error(errorMessage));

      try {
        await deleteUser(user.id);
      } catch (error) {
        expect(error.message).toBe(errorMessage);
        expect(error.statusCode).toBe(500);
      }
    });

    it('Should throw an error with message "Something went wrong" and statusCode 500 if unknown error occurred', async () => {
      const { User } = db;
      expect.assertions(2);
      const user = await createUser({
        firstname: 'Test',
        lastname: 'User',
        email: 'test@test.com',
        password: '123456',
      });
      const errorMessage = 'Something went wrong';
      vi.spyOn(User, 'destroy').mockRejectedValueOnce(new Error(errorMessage));

      try {
        await deleteUser(user.id);
      } catch (error) {
        expect(error.message).toBe(errorMessage);
        expect(error.statusCode).toBe(500);
      }
    });
  });
});
