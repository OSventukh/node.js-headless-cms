import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';

import app from '../../app';
import {
  createService,
  getService,
  updateService,
  deleteService,
} from '../../services/services.js';

describe('User controller', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });
  vi.mock('../../services/services');

  describe('Create user', () => {
    it('Should response with status code 201, when user created', async () => {
      const body = {
        firstname: 'Test firstname',
        lastname: 'Test lastname',
        email: 'test@test.com',
        password: 'test',
        role: 'writer',
      };

      const hashedPassword = vi.fn();

      hashedPassword.mockImplementationOnce(
        (password) => `'hashed' ${password}`
      );

      createService.mockImplementationOnce();

      const response = await request(app).post('/users').send(body);
      expect(response.statusCode).toBe(201);
    });

    it('Should response with status code 500 if user creating fails', async () => {
      const body = {
        firstname: 'Test firstname',
        lastname: 'Test lastname',
        email: 'test@test.com',
        password: 'test',
        role: 'writer',
      };

      createService.mockRejectedValueOnce(new Error());

      const response = await request(app).post('/users').send(body);
      expect(response.statusCode).toBe(500);
    });

    it('Should response with text "Could not create user" if user creating fails', async () => {
      const body = {
        firstname: 'Test firstname',
        lastname: 'Test lastname',
        email: 'test@test.com',
        password: 'test',
        role: 'writer',
      };

      createService.mockRejectedValueOnce(new Error());

      const response = await request(app).post('/users').send(body);
      expect(response.text).toContain('Could not create user');
    });
  });

  describe('Get users', () => {
    it('Should response with status code 200, if successfully get users', async () => {
      getService.mockImplementationOnce(() => [
        {
          firstname: 'Test firstname',
          lastname: 'Test lastname',
          email: 'test@test.com',
          password: 'test',
          role: 'writer',
        },
      ]);
      const response = await request(app).get('/users');
      expect(response.statusCode).toBe(200);
    });

    it('Should response object with property "users"', async () => {
      const body = [
        {
          firstname: 'Test firstname',
          lastname: 'Test lastname',
          email: 'test@test.com',
          password: 'test',
          role: 'writer',
        },
      ];
      getService.mockResolvedValueOnce(body);
      const response = await request(app).get('/users');
      expect(response.body).toHaveProperty('users');
    });

    it('Should response array that "getService" returns', async () => {
      const body = [
        {
          firstname: 'Test firstname',
          lastname: 'Test lastname',
          email: 'test@test.com',
          password: 'test',
          role: 'writer',
        },
      ];
      getService.mockResolvedValueOnce(body);
      const response = await request(app).get('/users');
      expect(response.body.users).toEqual(body);
    });

    it('Should response with status code 404 if getting users failed', async () => {
      getService.mockRejectedValueOnce(new Error());
      const response = await request(app).get('/users');
      expect(response.statusCode).toBe(404);
    });

    it('Should response with text "Could not find user(s)" if user does not exist', async () => {
      getService.mockRejectedValueOnce(new Error());

      const response = await request(app).get('/users');
      expect(response.text).toContain('Could not find user(s)');
    });
  });

  describe('update user', () => {
    it('Should response with status code 200, if updating was successfully', async () => {
      getService.mockResolvedValueOnce(true);
      updateService.mockImplementationOnce();
      const response = await request(app).patch('/users/1');
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 500, if updating was failed', async () => {
      updateService.mockRejectedValueOnce(new Error());
      const response = await request(app).patch('/users/1');
      expect(response.statusCode).toBe(500);
    });
  });

  describe('delete user', () => {
    it('Should response with status code 200, if deleting was successfully and id passed as reqest body', async () => {
      getService.mockResolvedValueOnce(true);
      deleteService.mockImplementationOnce();
      const response = await request(app)
        .delete('/users')
        .send({ id: [1] });
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 200, if deleting was successfully and id passed as url param', async () => {
      getService.mockResolvedValueOnce(true);
      deleteService.mockImplementationOnce();
      const response = await request(app).delete('/users/1');
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 500, if deleting was failed', async () => {
      deleteService.mockRejectedValueOnce(new Error());
      const response = await request(app).delete('/users/1');
      expect(response.statusCode).toBe(500);
    });

    it('Should response with text "Could not delete post", if deleting was failed', async () => {
      deleteService.mockRejectedValueOnce(new Error());
      const response = await request(app).delete('/users/1');
      expect(response.text).toContain('Could not delete user');
    });
  });
});
