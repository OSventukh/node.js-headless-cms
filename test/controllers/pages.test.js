import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import request from 'supertest';

import app from '../../app';
import {
  createPage,
  getPages,
  updatePage,
  deletePage,
} from '../../services/pages.services.js';

describe('Page controller', () => {
  beforeEach(() => {
    vi.mock('../../middlewares/auth.js', () => ({
      default: vi.fn(),
      auth: (req, res, next) => next(),
      rolesAccess: () => (req, res, next) => next(),
      canEditPost: (req, res, next) => next(),
    }));
    vi.mock('../../services/pages.services.js');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe('Create page', () => {
    it('Should response with status code 201, when page created', async () => {
      const body = {
        title: 'Test title',
        slug: 'slug',
        image: 'test',
        description: 'test',
      };

      createPage.mockImplementationOnce();

      const response = await request(app).post('/pages').send(body);
      expect(response.statusCode).toBe(201);
    });

    it('Should response with status code 500 if page creating fails', async () => {
      const body = {
        title: 'Test title',
        content: 'slug',
        slug: 'test',
        description: 'test',
        status: 'draft',
      };

      createPage.mockRejectedValueOnce(new Error());

      const response = await request(app).post('/pages').send(body);
      expect(response.statusCode).toBe(500);
    });

    it('Should response with error text that service returns', async () => {
      const body = {
        title: 'Test title',
        content: 'slug',
        slug: 'test',
        description: 'test',
        status: 'draft',
      };

      createPage.mockRejectedValueOnce(new Error('Something went wrong'));

      const response = await request(app).post('/pages').send(body);
      expect(response.text).toContain('Something went wrong');
    });
  });

  describe('Get pages', () => {
    it('Should response with status code 200, if successfully get pages', async () => {
      getPages.mockImplementationOnce(() => [
        {
          id: '1',
          title: 'Test title',
          slug: 'test-slug',
          description: 'Test description',
          status: 'active',
        },
      ]);
      const response = await request(app).get('/pages');
      expect(response.statusCode).toBe(200);
    });

    it('Should response object with count and pages properties', async () => {
      const body = {
        count: 1,
        rows: [
          {
            id: '1',
            title: 'Test title',
            slug: 'test-slug',
            description: 'Test description',
            status: 'active',
          },
        ],
      };
      getPages.mockResolvedValueOnce(body);
      const response = await request(app).get('/pages');
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('pages');
    });

    it('Should response with status code 500 if getting pages failed', async () => {
      getPages.mockRejectedValueOnce(new Error());
      const response = await request(app).get('/pages');
      expect(response.statusCode).toBe(500);
    });

    it('Should response with error text that service returns', async () => {
      getPages.mockRejectedValueOnce(new Error('Something went wrong'));

      const response = await request(app).get('/pages');
      expect(response.text).toContain('Something went wrong');
    });
  });

  describe('update page', () => {
    it('Should response with status code 200, if updating was successfully', async () => {
      getPages.mockResolvedValueOnce(true);
      updatePage.mockImplementationOnce();
      const response = await request(app).patch('/pages/1');
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 500, if updating was failed', async () => {
      updatePage.mockRejectedValueOnce(new Error());
      const response = await request(app).patch('/pages/1');
      expect(response.statusCode).toBe(500);
    });
  });

  describe('delete page', () => {
    it('Should response with status code 200, if deleting was successfully and id passed as reqest body', async () => {
      getPages.mockResolvedValueOnce(true);
      deletePage.mockImplementationOnce();
      const response = await request(app)
        .delete('/pages')
        .send({ id: [1] });
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 200, if deleting was successfully and id passed as url param', async () => {
      getPages.mockResolvedValueOnce(true);
      deletePage.mockImplementationOnce();
      const response = await request(app).delete('/pages/1');
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 500, if deleting was failed', async () => {
      deletePage.mockRejectedValueOnce(new Error());
      const response = await request(app).delete('/pages/1');
      expect(response.statusCode).toBe(500);
    });

    it('Should response with error text that service returns', async () => {
      deletePage.mockRejectedValueOnce(new Error('Something went wrong'));
      const response = await request(app).delete('/pages/1');
      expect(response.text).toContain('Something went wrong');
    });
  });
});
