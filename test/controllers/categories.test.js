import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import request from 'supertest';

import app from '../../app.js';
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from '../../services/categories.services.js';

describe('Category controller', () => {
  beforeEach(() => {
    vi.mock('../../middlewares/auth.js', () => ({
      default: vi.fn(),
      auth: (req, res, next) => next(),
      rolesAccess: () => (req, res, next) => next(),
      canEditPost: (req, res, next) => next(),
    }));
    vi.mock('../../services/categories.services.js');
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe('Create categories', () => {
    it('Should response with status code 201, when categories created', async () => {
      const body = {
        name: 'Test category',
        slug: 'test-category',
      };

      createCategory.mockImplementationOnce();

      const response = await request(app).post('/categories').send(body);
      expect(response.statusCode).toBe(201);
    });

    it('Should response with status code 500 if categories creating fails', async () => {
      const body = {
        name: 'Test category',
        slug: 'test-category',
      };

      createCategory.mockRejectedValueOnce(new Error());

      const response = await request(app).post('/categories').send(body);
      expect(response.statusCode).toBe(500);
    });

    it('Should response with error text that service returns', async () => {
      const body = {
        name: 'Test category',
        slug: 'test-category',
      };

      createCategory.mockRejectedValueOnce(new Error('Something went wrong'));

      const response = await request(app).post('/categories').send(body);
      expect(response.text).toContain('Something went wrong');
    });
  });

  describe('Get categories', () => {
    it('Should response with status code 200, if successfully get categories', async () => {
      getCategories.mockImplementationOnce(() => [
        {
          name: 'Test category',
          slug: 'test-category',
        },
      ]);
      const response = await request(app).get('/categories');
      expect(response.statusCode).toBe(200);
    });

    it('Should response object with count and categories properties', async () => {
      const body = {
        count: 1,
        rows: [
          {
            id: '1',
            name: 'Test category',
            slug: 'test-category',
          },
        ],
      };
      getCategories.mockResolvedValueOnce(body);
      const response = await request(app).get('/categories');
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('categories');
    });

    it('Should response with status code 500 if getting categories failed', async () => {
      getCategories.mockRejectedValueOnce(new Error());
      const response = await request(app).get('/categories');
      expect(response.statusCode).toBe(500);
    });

    it('Should response with error text that service returns', async () => {
      getCategories.mockRejectedValueOnce(new Error('Something went wrong'));

      const response = await request(app).get('/categories');
      expect(response.text).toContain('Something went wrong');
    });
  });

  describe('update categories', () => {
    it('Should response with status code 200, if updating was successfully', async () => {
      getCategories.mockResolvedValueOnce(true);
      updateCategory.mockImplementationOnce();
      const response = await request(app).patch('/categories/1');
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 500, if updating was failed', async () => {
      updateCategory.mockRejectedValueOnce(new Error());
      const response = await request(app).patch('/categories/1');
      expect(response.statusCode).toBe(500);
    });
  });

  describe('delete categories', () => {
    it('Should response with status code 200, if deleting was successfully and id passed as reqest body', async () => {
      deleteCategory.mockResolvedValueOnce(1);
      const response = await request(app)
        .delete('/categories')
        .send({ id: [1] });
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 200, if deleting was successfully and id passed as url param', async () => {
      deleteCategory.mockResolvedValueOnce(1);
      const response = await request(app).delete('/categories/1');
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 500, if deleting was failed', async () => {
      deleteCategory.mockRejectedValueOnce(new Error());
      const response = await request(app).delete('/categories/1');
      expect(response.statusCode).toBe(500);
    });

    it('Should response with error text that service returns', async () => {
      deleteCategory.mockRejectedValueOnce(new Error('Something went wrong'));
      const response = await request(app).delete('/categories/1');
      expect(response.text).toContain('Something went wrong');
    });
  });
});
