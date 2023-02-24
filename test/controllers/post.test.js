import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';

import app from '../../app';
import {
  createPost,
  getPosts,
  updatePost,
  deletePost,
} from '../../services/posts.services.js';

describe('Post controller', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });
  vi.mock('../../services/posts.services.js');

  describe('Create post', () => {
    it('Should response with status code 201, when post created', async () => {
      const body = {
        title: 'Test title',
        slug: 'slug',
        image: 'test',
        description: 'test',
      };

      createPost.mockImplementationOnce();

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

      createPost.mockRejectedValueOnce(new Error());

      const response = await request(app).post('/posts').send(body);
      expect(response.statusCode).toBe(500);
    });

    it('Should response with error text that service returns', async () => {
      const body = {
        title: 'Test title',
        content: 'slug',
        slug: 'test',
        excerpt: 'test',
        status: 'draft',
      };

      createPost.mockRejectedValueOnce(new Error('Something went wrong'));

      const response = await request(app).post('/posts').send(body);
      expect(response.text).toContain('Something went wrong');
    });
  });

  describe('Get posts', () => {
    it('Should response with status code 200, if successfully get posts', async () => {
      getPosts.mockImplementationOnce(() => [
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

    it('Should response object with count and posts properties', async () => {
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
      getPosts.mockResolvedValueOnce(body);
      const response = await request(app).get('/posts');
      expect(response.body).haveOwnProperty('count');
      expect(response.body).haveOwnProperty('posts');
    });

    it('Should response with status code 500 if getting post failed', async () => {
      getPosts.mockRejectedValueOnce(new Error());
      const response = await request(app).get('/posts');
      expect(response.statusCode).toBe(500);
    });

    it('Should response with error text that service returns', async () => {
      getPosts.mockRejectedValueOnce(new Error('Something went wrong'));

      const response = await request(app).get('/posts');
      expect(response.text).toContain('Something went wrong');
    });
  });

  describe('update post', () => {
    it('Should response with status code 200, if updating was successfully', async () => {
      getPosts.mockResolvedValueOnce(true);
      updatePost.mockImplementationOnce();
      const response = await request(app).patch('/posts/1');
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 500, if updating was failed', async () => {
      updatePost.mockRejectedValueOnce(new Error());
      const response = await request(app).patch('/posts/1');
      expect(response.statusCode).toBe(500);
    });
  });

  describe('delete post', () => {
    it('Should response with status code 200, if deleting was successfully and id passed as reqest body', async () => {
      getPosts.mockResolvedValueOnce(true);
      deletePost.mockImplementationOnce();
      const response = await request(app)
        .delete('/posts')
        .send({ id: [1] });
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 200, if deleting was successfully and id passed as url param', async () => {
      getPosts.mockResolvedValueOnce(true);
      deletePost.mockImplementationOnce();
      const response = await request(app).delete('/posts/1');
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 500, if deleting was failed', async () => {
      deletePost.mockRejectedValueOnce(new Error());
      const response = await request(app).delete('/posts/1');
      expect(response.statusCode).toBe(500);
    });

    it('Should response with error text that service returns', async () => {
      deletePost.mockRejectedValueOnce(new Error('Something went wrong'));
      const response = await request(app).delete('/posts/1');
      expect(response.text).toContain('Something went wrong');
    });
  });
});
