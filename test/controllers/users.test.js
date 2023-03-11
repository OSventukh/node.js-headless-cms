import { describe, it, expect, vi, beforeAll, afterEach, afterAll, beforeEach } from 'vitest';
import request from 'supertest';

import app from '../../app';
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} from '../../services/users.services.js';
import auth from '../../middlewares/auth';

describe('User controller', () => {
  beforeEach(() => {
    vi.mock('../../services/users.services.js');
    vi.mock('../../middlewares/auth');
    auth.mockImplementationOnce((req, res, next) => next());
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  describe('Create user', () => {
    it('Should response with status code 201, when user created', async () => {
      const body = {
        firstname: 'Test firstname',
        lastname: 'Test lastname',
        email: 'test@test.com',
        password: '12345',
        role: 'writer',
      };

      createUser.mockImplementationOnce();

      const response = await request(app).post('/users').send(body);
      expect(response.statusCode).toBe(201);
    });

    it('Should response with status code 500 if user creating fails', async () => {
      const body = {
        firstname: 'Test firstname',
        lastname: 'Test lastname',
        email: 'test@test.com',
        password: '12345',
        role: 'writer',
      };

      createUser.mockRejectedValueOnce(new Error());

      const response = await request(app).post('/users').send(body);
      expect(response.statusCode).toBe(500);
    });

    it('Should response with error text that service returns', async () => {
      const body = {
        firstname: 'Test firstname',
        lastname: 'Test lastname',
        email: 'test@test.com',
        password: '12345',
        role: 'writer',
      };

      createUser.mockRejectedValueOnce(new Error('Something went wrong'));

      const response = await request(app).post('/users').send(body);
      expect(response.text).toContain('Something went wrong');
    });
  });

  describe('Get users', () => {
    it('Should response with status code 200, if successfully get users', async () => {
      getUsers.mockResolvedValueOnce(
        {
          count: 1,
          rows: [
            {
              id: 1,
              firstname: 'Test firstname',
              lastname: 'Test lastname',
              email: 'test@test.com',
              password: 'test',
              role: 'writer',
            },
          ],
        },
      );
      const response = await request(app).get('/users');
      expect(response.statusCode).toBe(200);
    });

    it('Should response object with count and users properties', async () => {
      const body = {
        count: 1,
        rows: [
          {
            id: 1,
            firstname: 'Test firstname',
            lastname: 'Test lastname',
            email: 'test@test.com',
            password: 'test',
            role: 'writer',
          },
        ],
      };
      getUsers.mockResolvedValueOnce(body);
      const response = await request(app).get('/users');
      expect(response.body).haveOwnProperty('count');
      expect(response.body).haveOwnProperty('users');
    });

    it('Should response with status code 500 if getting users failed', async () => {
      getUsers.mockRejectedValueOnce(new Error());
      const response = await request(app).get('/users');
      expect(response.statusCode).toBe(500);
    });

    it('Should response with error text that service returns', async () => {
      getUsers.mockRejectedValueOnce(new Error('Something went wrong'));

      const response = await request(app).get('/users');
      expect(response.text).toContain('Something went wrong');
    });
  });

  describe('update user', () => {
    it('Should response with status code 200, if updating was successfully', async () => {
      updateUser.mockResolvedValueOnce(true);
      updateUser.mockImplementationOnce();
      const response = await request(app).patch('/users/1');
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 500, if updating was failed', async () => {
      updateUser.mockRejectedValueOnce(new Error());
      const response = await request(app).patch('/users/1');
      expect(response.statusCode).toBe(500);
    });
  });

  describe('delete user', () => {
    it('Should response with status code 200, if deleting was successfully and id passed as reqest body', async () => {
      updateUser.mockResolvedValueOnce(true);
      deleteUser.mockImplementationOnce();
      const response = await request(app)
        .delete('/users')
        .send({ id: [1] });
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 200, if deleting was successfully and id passed as url param', async () => {
      updateUser.mockResolvedValueOnce(true);
      deleteUser.mockImplementationOnce();
      const response = await request(app).delete('/users/1');
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 500, if deleting was failed', async () => {
      deleteUser.mockRejectedValueOnce(new Error());
      const response = await request(app).delete('/users/1');
      expect(response.statusCode).toBe(500);
    });

    it('Should response with error text that service returns', async () => {
      deleteUser.mockRejectedValueOnce(new Error('Something went wrong'));
      const response = await request(app).delete('/users/1');
      expect(response.text).toContain('Something went wrong');
    });
  });
});
