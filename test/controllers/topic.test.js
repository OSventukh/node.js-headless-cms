import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';

import app from '../../app';
import {
  createTopicService,
  getTopicsService,
  updateTopicService,
  deleteTopicService,
} from '../../services/topic.services';

describe('Topic controller', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });
  vi.mock('../../services/topic.services');

  describe('Create topic', () => {
    it('Should response with status code 201, when topic created', async () => {
      const body = {
        title: 'Test title',
        slug: 'slug',
        image: 'test',
        description: 'test',
      };

      createTopicService.mockImplementationOnce();

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

      createTopicService.mockRejectedValueOnce(new Error());

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

      createTopicService.mockRejectedValueOnce(new Error());

      const response = await request(app).post('/topics').send(body);
      expect(response.text).toContain('Could not create topic');
    });
  });

  describe('Get topics', () => {
    it('Should response with status code 200, if successfully get topics', async () => {
      getTopicsService.mockImplementationOnce(() => [
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
      getTopicsService.mockResolvedValueOnce(body);
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
      getTopicsService.mockResolvedValueOnce(body);
      const response = await request(app).get('/topics');
      expect(response.body.topics).toEqual(body);
    });

    it('Should response with status code 500 if getting topics failed', async () => {
      getTopicsService.mockRejectedValueOnce(new Error());
      const response = await request(app).get('/topics');
      expect(response.statusCode).toBe(500);
    });

    it('Should response with text "Could not find topic(s)" if getting topis failed', async () => {
      getTopicsService.mockRejectedValueOnce(new Error());

      const response = await request(app).get('/topics');
      expect(response.text).toContain('Could not find topic(s)');
    });
  });

  describe('update topic', () => {
    it('Should response with status code 200, if updating was successfully', async () => {
      updateTopicService.mockImplementationOnce();
      const response = await request(app).patch('/topics/1');
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 500, if updating was failed', async () => {
      updateTopicService.mockRejectedValueOnce(new Error());
      const response = await request(app).patch('/topics/1');
      expect(response.statusCode).toBe(500);
    });
  });

  describe('delete topic', () => {
    it('Should response with status code 200, if deleting was successfully', async () => {
      deleteTopicService.mockImplementationOnce();
      const response = await request(app).delete('/topics').send({ topicIds: [1] });
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 500, if deleting was failed', async () => {
      deleteTopicService.mockRejectedValueOnce(new Error());
      const response = await request(app).delete('/topics/1');
      expect(response.statusCode).toBe(500);
    });

    it('Should response with text "Could not delete post", if deleting was failed', async () => {
      deleteTopicService.mockRejectedValueOnce(new Error());
      const response = await request(app).delete('/topics/1');
      expect(response.text).toContain('Could not delete post');
    });
  });
});
