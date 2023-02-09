import {
  createPostService,
  getPostsService,
  deletePostService,
} from '../services/post.services.js';

export const getPosts = async (req, res, next) => {
  const { postId } = req.params;
  const { slug, status } = req.query;

  let whereOptions;

  if (postId) {
    whereOptions = { id: postId };
  }

  if (slug || status) {
    whereOptions = {
      ...(slug && { slug }),
      ...(status && { status }),
    };
  }

  try {
    const post = await getPostsService(whereOptions);
    res.status(200).json({
      post,
    });
  } catch (error) {
    res.status(404).json({
      message: 'Could not find this post',
    });
  }
};

export const createPost = async (req, res, next) => {
  const { title, content, excerpt, slug, status } = req.body;

  try {
    await createPostService(title, content, excerpt, slug, status);
    res.status(201).json({
      message: 'Post successfully created',
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deletePost = async (req, res, next) => {
  const { postIds } = req.body;

  try {
    Promise.all(
      postIds.map(async (id) => {
        await deletePostService({ id });
      }),
    );
    res.status(200).json({
      message: 'Post was successfully deleted',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Deleting post failed',
    });
  }
};
