import jwt from 'jsonwebtoken';
import HttpError from '../utils/http-error.js';
import { Post, UserBlockedToken, User } from '../models/index.js';
import { ADMIN, MODER, WRITER } from '../utils/constants/roles.js';
import { BLOCKED } from '../utils/constants/status.js';

export async function auth(req, res, next) {
  try {
    const authHeader = req.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      throw new HttpError('Not Authenticated', 401);
    }

    // Check if the accessToken provided by the user is not already blocked.
    const blockedToken = await UserBlockedToken.findOne({
      where: {
        token,
      },
    });

    if (blockedToken) {
      throw new HttpError('Not Authenticated', 401);
    }

    const { id } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
    const user = await User.findByPk(id);

    if (!user) {
      throw new HttpError('Not Authenticated', 401);
    }

    if (user.status === BLOCKED) {
      throw new HttpError('Access is denied', 403);
    }

    req.authUser = user;
    return next();
  } catch (error) {
    return next(new HttpError('Not Authenticated', 401));
  }
}

export function rolesAccess(roles = []) {
  return async (req, res, next) => {
    try {
      const user = req.authUser;
      const userRole = await user.getRole();

      if (roles.includes(userRole.name)) {
        return next();
      }
      throw new HttpError('No access to perform this action', 403);
    } catch (error) {
      return next(new HttpError(error.message, error.statusCode));
    }
  };
}

export const canEditPost = async (req, res, next) => {
  try {
    const user = req.authUser;
    const userRole = await user.getRole();
    const postId = req.params.postId || req.body.id;

    if (!postId) {
      throw new HttpError('Post id is not valid', 422);
    }

    if (userRole.name === ADMIN) {
      return next();
    }

    const post = await Post.findByPk(postId);

    const [postTopic, userTopic] = await Promise.all([
      post.getTopics(),
      user.getTopics(),
    ]);

    // check if user belongs to current post topic
    const commonTopic = userTopic.filter(
      (uTopic) => postTopic.some((pTopic) => uTopic.id === pTopic.id),
    );

    // moderator have access to all post within their topics
    if (userRole.name === MODER && commonTopic.length > 0) {
      return next();
    }

    // writter have access only to own post
    if (userRole.name === WRITER && (await user.hasPost(post))) {
      return next();
    }
    throw new HttpError('Not Authorized', 401);
  } catch (error) {
    return next(new HttpError(error.message, error.statusCode));
  }
};
