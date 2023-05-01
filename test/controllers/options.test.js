import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import request from 'supertest';

import app from '../../app';
import {
  getOptions,
  updateOption,
} from '../../services/options.services.js';

describe('Option controller', () => {
  beforeEach(() => {
    vi.mock('../../middlewares/auth.js', () => ({
      default: vi.fn(),
      auth: (req, res, next) => next(),
      rolesAccess: () => (req, res, next) => next(),
      canEditPost: (req, res, next) => next(),
    }));
    vi.mock('../../services/options.services.js');
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe('Get options', () => {
    it('Should response with status code 200, if successfully get options', async () => {
      getOptions.mockResolvedValueOnce(
        {
          id: '1',
          name: 'site-name',
          value: 'Test name',
        },
      );
      const response = await request(app).get('/site');
      expect(response.statusCode).toBe(200);
    });

    it('Should response object with count and options properties', async () => {
      const body = {
        count: 1,
        rows: [
          {
            id: '1',
            name: 'site-name',
            value: 'Test name',
          },
        ],
      };
      getOptions.mockResolvedValueOnce(body);
      const response = await request(app).get('/site');
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('options');
    });

    it('Should response with status code 500 if getting options failed', async () => {
      getOptions.mockRejectedValueOnce(new Error());
      const response = await request(app).get('/site/');
      expect(response.statusCode).toBe(500);
    });

    it('Should response with error text that service returns', async () => {
      getOptions.mockRejectedValueOnce(new Error('Something went wrong'));

      const response = await request(app).get('/site/');
      expect(response.text).toContain('Something went wrong');
    });
  });

  describe('update option', () => {
    it('Should response with status code 200, if updating was successfully', async () => {
      getOptions.mockResolvedValueOnce(true);
      updateOption.mockImplementationOnce();
      const response = await request(app).patch('/site/site-name');
      expect(response.statusCode).toBe(200);
    });

    it('Should response with status code 500, if updating was failed', async () => {
      updateOption.mockRejectedValueOnce(new Error());
      const response = await request(app).patch('/site/site-name');
      expect(response.statusCode).toBe(500);
    });
  });
});
