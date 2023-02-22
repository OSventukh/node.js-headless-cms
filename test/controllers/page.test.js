import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';

import app from '../../app';
import {
  createService,
  getService,
  updateService,
  deleteService,
} from '../../services/services.js';

describe('Page controller', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });
  vi.mock('../../services/services');

  describe('Create page', () => {
    it('Should response with status code 201, when page created', async () => {
      const body = {
        title: 'Test title',
        slug: 'slug',
        image: 'test',
        description: 'test',
      };

      createService.mockImplementationOnce();

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

      createService.mockRejectedValueOnce(new Error());

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

      createService.mockRejectedValueOnce(new Error('Something went wrong'));

      const response = await request(app).post('/pages').send(body);
      expect(response.text).toContain('Something went wrong');
    });
  });

  describe('Get pages', () => {
    it('Should response with status code 200, if successfully get pages', async () => {
      getService.mockImplementationOnce(() => [
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

    it('Should response object with property "pages"', async () => {
      const body = [
        {
          id: '1',
          title: 'Test title',
          slug: 'test-slug',
          description: 'Test description',
          status: 'active',
        },
      ];
      getService.mockResolvedValueOnce(body);
      const response = await request(app).get('/pages');
      expect(response.body).toHaveProperty('pages');
    });

    it('Should response array that "getService" returns', async () => {
      const body = [
        {
          id: '1',
          title: 'Test title',
          slug: 'test-slug',
          description: 'Test description',
          status: 'active',
        },
      ];
      getService.mockResolvedValueOnce(body);
      const response = await request(app).get('/pages');
      expect(response.body.pages).toEqual(body);
    });

    it('Should response with status code 500 if getting pages failed', async () => {
      getService.mockRejectedValueOnce(new Error());
      const response = await request(app).get('/pages');
      expect(response.statusCode).toBe(500);
    });

    it('Should response with text "Could not find page(s)" if getting topis failed', async () => {
      getService.mockRejectedValueOnce(new Error());

      const response = await request(app).get('/pages');
      expect(response.text).toContain('Could not find page(s)');
    });
  });

  describe('update page', () => {
    it('Should response with status code 200, if updating was successfully', async () => {
      getService.mockResolvedValueOnce(true);
      updateService.mockImplementationOnce();
      const response = await request(app).patch('/pages/1');
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 500, if updating was failed', async () => {
      updateService.mockRejectedValueOnce(new Error());
      const response = await request(app).patch('/pages/1');
      expect(response.statusCode).toBe(500);
    });
  });

  describe('delete page', () => {
    it('Should response with status code 200, if deleting was successfully and id passed as reqest body', async () => {
      getService.mockResolvedValueOnce(true);
      deleteService.mockImplementationOnce();
      const response = await request(app)
        .delete('/pages')
        .send({ id: [1] });
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 200, if deleting was successfully and id passed as url param', async () => {
      getService.mockResolvedValueOnce(true);
      deleteService.mockImplementationOnce();
      const response = await request(app).delete('/pages/1');
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 500, if deleting was failed', async () => {
      deleteService.mockRejectedValueOnce(new Error());
      const response = await request(app).delete('/pages/1');
      expect(response.statusCode).toBe(500);
    });

    it('Should response with text "Could not delete page", if deleting was failed', async () => {
      deleteService.mockRejectedValueOnce(new Error());
      const response = await request(app).delete('/pages/1');
      expect(response.text).toContain('Could not delete page');
    });
  });
});
