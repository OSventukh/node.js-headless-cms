import HttpError from '../utils/http-error.js';
import { Post, Topic, User } from '../models/index.js';

export const getGeneralStatistics = async (req, res, next) => {
  try {
    const [posts, users, topics] = await Promise.all([Post.count({ group: ['status'] }), User.count(), Topic.count()]);
    const publishedPosts = posts.filter((post) => post.status === 'published')[0]?.count || 0;
    const draftPosts = posts.filter((post) => post.status === 'draft')[0]?.count || 0;
    const allPosts = publishedPosts + draftPosts;

    
    res.status(200).json({
      posts: {
        all: allPosts,
        published: publishedPosts,
        draft: draftPosts,
      },
      users: {
        all: users,
      },
      topics: {
        all: topics,
      },
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};
