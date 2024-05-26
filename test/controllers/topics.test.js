import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  afterAll,
} from 'vitest';
import request from 'supertest';

import app from '../../app';
import {
  createTopic,
  getTopics,
  updateTopic,
  deleteTopic,
} from '../../services/topics.services.js';

describe('Topic controller', () => {
  beforeEach(() => {
    vi.mock('../../middlewares/auth.js', () => ({
      default: vi.fn(),
      auth: (req, res, next) => next(),
      rolesAccess: () => (req, res, next) => next(),
      canEditPost: (req, res, next) => next(),
    }));
    vi.mock('../../services/topics.services.js');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe('Create topic', () => {
    it('Should response with status code 201, when topic created', async () => {
      const body = {
        title: 'Test title',
        slug: 'slug',
        image: 'test',
        description: 'test',
      };

      createTopic.mockImplementationOnce();

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

      createTopic.mockRejectedValueOnce(new Error());

      const response = await request(app).post('/topics').send(body);
      expect(response.statusCode).toBe(500);
    });

    it('Should response with error text that service returns', async () => {
      const body = {
        title: 'Test title',
        slug: 'slug',
        image: 'test',
        description: 'test',
      };

      createTopic.mockRejectedValueOnce(new Error('Something went wrong'));

      const response = await request(app).post('/topics').send(body);
      expect(response.text).toContain('Something went wrong');
    });
  });

  describe('Get topics', () => {
    it('Should response with status code 200, if successfully get topics', async () => {
      getTopics.mockImplementationOnce(() => [
        {
          title: 'Test title',
          slug: 'slug',
          image: 'test',
          description: 'test',
        },
      ]);
      const response = await request(app).get('/topics');
      expect(response.statusCode).toBe(200);
    });

    it('Should response object with count and topics properties', async () => {
      const body = {
        count: 1,
        rows: [
          {
            title: 'Test title',
            slug: 'slug',
            image: 'test',
            description: 'test',
          },
        ],
      };
      getTopics.mockResolvedValueOnce(body);
      const response = await request(app).get('/topics');
      expect(response.body).haveOwnProperty('count');
      expect(response.body).haveOwnProperty('topics');
    });

    it('Should response with status code 500 if getting topics failed', async () => {
      getTopics.mockRejectedValueOnce(new Error());
      const response = await request(app).get('/topics');
      expect(response.statusCode).toBe(500);
    });

    it('Should response with error text that service returns', async () => {
      getTopics.mockRejectedValueOnce(new Error('Something went wrong'));

      const response = await request(app).get('/topics');
      expect(response.text).toContain('Something went wrong');
    });
  });

  describe('update topic', () => {
    it('Should response with status code 200, if updating was successfully', async () => {
      getTopics.mockResolvedValueOnce(true);
      updateTopic.mockImplementationOnce();
      const response = await request(app).patch('/topics/1');
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 500, if updating was failed', async () => {
      updateTopic.mockRejectedValueOnce(new Error());
      const response = await request(app).patch('/topics/1');
      expect(response.statusCode).toBe(500);
    });
  });

  describe('delete topic', () => {
    it('Should response with status code 200, if deleting was successfully and id passed as reqest body', async () => {
      getTopics.mockResolvedValueOnce(true);
      deleteTopic.mockImplementationOnce();
      const response = await request(app)
        .delete('/topics')
        .send({ id: [1] });
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 200, if deleting was successfully and id passed as url param', async () => {
      getTopics.mockResolvedValueOnce(true);
      deleteTopic.mockImplementationOnce();
      const response = await request(app).delete('/topics/1');
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 500, if deleting was failed', async () => {
      deleteTopic.mockRejectedValueOnce(new Error());
      const response = await request(app).delete('/topics/1');
      expect(response.statusCode).toBe(500);
    });

    it('Should response with error text that service returns', async () => {
      deleteTopic.mockRejectedValueOnce(new Error('Something went wrong'));
      const response = await request(app).delete('/topics/1');
      expect(response.text).toContain('Something went wrong');
    });
  });
});
