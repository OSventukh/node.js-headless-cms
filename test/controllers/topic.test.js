import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';

import app from '../../app';
import { createTopicService, getTopicsService } from '../../services/topic.services';

describe('Topic controller', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Create topic', () => {
    vi.mock('../../services/topic.services');

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
    vi.mock('getTopicsService');

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
});
