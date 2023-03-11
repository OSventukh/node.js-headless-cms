import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import HttpError from '../../utils/http-error.js';
import { UserBlockedToken } from '../../models/index.js';
import auth from '../../middlewares/auth.js';

describe('Auth middleware', () => {
  const mockUser = {
    id: '1',
    email: 'test@test.com',
  };
  vi.stubEnv('ACCESS_TOKEN_SECRET_KEY', 'secret');
  const mockToken = jwt.sign(
    { userId: mockUser.id },
    process.env.ACCESS_TOKEN_SECRET_KEY
  );

  const req = {
    get(arg) {
      if (arg === 'authorization' || arg === 'Authorization') {
        return `Bearer ${mockToken}`;
      }
      return null;
    },
  };
  const res = {};
  const next = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Should return next() function without arguments if accessToken is valid', async () => {
    await auth(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('Should add auth property with user id to request object if accessToken is valid', async () => {
    await auth(req, res, next);
    expect(req).haveOwnProperty('auth');
    expect(req.auth.userId).toBe(mockUser.id);
  });

  it('Should check if provided accessToken not blocked', async () => {
    vi.spyOn(UserBlockedToken, 'findOne');
    await auth(req, res, next);
    expect(UserBlockedToken.findOne).toHaveBeenCalledWith({
      where: { token: mockToken },
    });
  });

  it('Should call next() with an error with message "Not Authenticated" and status code 401 if token not provided', async () => {
    const req2 = {
      get(arg) {
        if (arg === 'authorization' || arg === 'Authorization') {
          return null;
        }
        return null;
      },
    };
    await auth(req2, res, next);
    expect(next).toHaveBeenCalledWith(new HttpError('Not Authenticated', 401));
  });

  it('Should call next() with an error with message "Not Authenticated" and status code 401 if token blocked', async () => {
    vi.spyOn(UserBlockedToken, 'findOne').mockResolvedValue(true);
    await auth(req, res, next);
    expect(next).toHaveBeenCalledWith(new HttpError('Not Authenticated', 401));
  });
});
