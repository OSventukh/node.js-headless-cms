import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';

import app from '../../app';
import {
  createService,
  getService,
  updateService,
  deleteService,
} from '../../services/services.js';

describe('Topic controller', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });
  vi.mock('../../services/services');

  describe('Create topic', () => {
    it('Should response with status code 201, when topic created', async () => {
      const body = {
        title: 'Test title',
        slug: 'slug',
        image: 'test',
        description: 'test',
      };

      createService.mockImplementationOnce();

      const response = await request(app).post('/topics').send(body);
      expect(response.statusCode).toBe(201);
    });

    it('Should response with status code 500 if topic creating fails', async () => {
      const body = {
        title: 'Test title',
        slug: 'slug',
        image: 'test',
        description: 'test',
      };

      createService.mockRejectedValueOnce(new Error());

      const response = await request(app).post('/topics').send(body);
      expect(response.statusCode).toBe(500);
    });

    it('Should response with text "Could not create topic" if topic creating fails', async () => {
      const body = {
        title: 'Test title',
        slug: 'slug',
        image: 'test',
        description: 'test',
      };

      createService.mockRejectedValueOnce(new Error());

      const response = await request(app).post('/topics').send(body);
      expect(response.text).toContain('Could not create topic');
    });
  });

  describe('Get topics', () => {
    it('Should response with status code 200, if successfully get topics', async () => {
      getService.mockImplementationOnce(() => [
        {
          id: '1',
          title: 'Test title',
          slug: 'test-slug',
          description: 'Test description',
          status: 'active',
        },
      ]);
      const response = await request(app).get('/topics');
      expect(response.statusCode).toBe(200);
    });

    it('Should response object with property "topics"', async () => {
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
      const response = await request(app).get('/topics');
      expect(response.body).toHaveProperty('topics');
    });

    it('Should response array that "getTopicsService" returns', async () => {
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
      const response = await request(app).get('/topics');
      expect(response.body.topics).toEqual(body);
    });

    it('Should response with status code 500 if getting topics failed', async () => {
      getService.mockRejectedValueOnce(new Error());
      const response = await request(app).get('/topics');
      expect(response.statusCode).toBe(500);
    });

    it('Should response with text "Could not find topic(s)" if getting topis failed', async () => {
      getService.mockRejectedValueOnce(new Error());

      const response = await request(app).get('/topics');
      expect(response.text).toContain('Could not find topic(s)');
    });
  });

  describe('update topic', () => {
    it('Should response with status code 200, if updating was successfully', async () => {
      getService.mockResolvedValueOnce(true);
      updateService.mockImplementationOnce();
      const response = await request(app).patch('/topics/1');
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 500, if updating was failed', async () => {
      updateService.mockRejectedValueOnce(new Error());
      const response = await request(app).patch('/topics/1');
      expect(response.statusCode).toBe(500);
    });
  });

  describe('delete topic', () => {
    it('Should response with status code 200, if deleting was successfully and id passed as reqest body', async () => {
      getService.mockResolvedValueOnce(true);
      deleteService.mockImplementationOnce();
      const response = await request(app)
        .delete('/topics')
        .send({ id: [1] });
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 200, if deleting was successfully and id passed as url param', async () => {
      getService.mockResolvedValueOnce(true);
      deleteService.mockImplementationOnce();
      const response = await request(app).delete('/topics/1');
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 500, if deleting was failed', async () => {
      deleteService.mockRejectedValueOnce(new Error());
      const response = await request(app).delete('/topics/1');
      expect(response.statusCode).toBe(500);
    });

    it('Should response with text "Could not delete post", if deleting was failed', async () => {
      deleteService.mockRejectedValueOnce(new Error());
      const response = await request(app).delete('/topics/1');
      expect(response.text).toContain('Could not delete post');
    });
  });
});
