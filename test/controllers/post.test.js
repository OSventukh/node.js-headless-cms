import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';

import app from '../../app';
import {
  createService,
  getService,
  updateService,
  deleteService,
} from '../../services/services.js';

describe('Post controller', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });
  vi.mock('../../services/services');

  describe('Create post', () => {
    it('Should response with status code 201, when post created', async () => {
      const body = {
        title: 'Test title',
        slug: 'slug',
        image: 'test',
        description: 'test',
      };

      createService.mockImplementationOnce();

      const response = await request(app).post('/posts').send(body);
      expect(response.statusCode).toBe(201);
    });

    it('Should response with status code 500 if post creating fails', async () => {
      const body = {
        title: 'Test title',
        slug: 'slug',
        image: 'test',
        description: 'test',
      };

      createService.mockRejectedValueOnce(new Error());

      const response = await request(app).post('/posts').send(body);
      expect(response.statusCode).toBe(500);
    });

    it('Should response with text "Could not create post" if post creating fails', async () => {
      const body = {
        title: 'Test title',
        content: 'slug',
        slug: 'test',
        excerpt: 'test',
        status: 'draft',
      };

      createService.mockRejectedValueOnce(new Error());

      const response = await request(app).post('/posts').send(body);
      expect(response.text).toContain('Could not create post');
    });
  });

  describe('Get posts', () => {
    it('Should response with status code 200, if successfully get posts', async () => {
      getService.mockImplementationOnce(() => [
        {
          id: '1',
          title: 'Test title',
          slug: 'test-slug',
          description: 'Test description',
          status: 'active',
        },
      ]);
      const response = await request(app).get('/posts');
      expect(response.statusCode).toBe(200);
    });

    it('Should response object with property "posts"', async () => {
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
      const response = await request(app).get('/posts');
      expect(response.body).toHaveProperty('posts');
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
      const response = await request(app).get('/posts');
      expect(response.body.posts).toEqual(body);
    });

    it('Should response with status code 404 if post does not exist', async () => {
      getService.mockRejectedValueOnce(new Error());
      const response = await request(app).get('/posts');
      expect(response.statusCode).toBe(404);
    });

    it('Should response with text "Could not find post(s)" if getting topis failed', async () => {
      getService.mockRejectedValueOnce(new Error());

      const response = await request(app).get('/posts');
      expect(response.text).toContain('Could not find post(s)');
    });
  });

  describe('update post', () => {
    it('Should response with status code 200, if updating was successfully', async () => {
      getService.mockResolvedValueOnce(true);
      updateService.mockImplementationOnce();
      const response = await request(app).patch('/posts/1');
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 500, if updating was failed', async () => {
      updateService.mockRejectedValueOnce(new Error());
      const response = await request(app).patch('/posts/1');
      expect(response.statusCode).toBe(500);
    });
  });

  describe('delete post', () => {
    it('Should response with status code 200, if deleting was successfully and id passed as reqest body', async () => {
      getService.mockResolvedValueOnce(true);
      deleteService.mockImplementationOnce();
      const response = await request(app)
        .delete('/posts')
        .send({ id: [1] });
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 200, if deleting was successfully and id passed as url param', async () => {
      getService.mockResolvedValueOnce(true);
      deleteService.mockImplementationOnce();
      const response = await request(app).delete('/posts/1');
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 500, if deleting was failed', async () => {
      deleteService.mockRejectedValueOnce(new Error());
      const response = await request(app).delete('/posts/1');
      expect(response.statusCode).toBe(500);
    });

    it('Should response with text "Could not delete post", if deleting was failed', async () => {
      deleteService.mockRejectedValueOnce(new Error());
      const response = await request(app).delete('/posts/1');
      expect(response.text).toContain('Could not delete post');
    });
  });
});
