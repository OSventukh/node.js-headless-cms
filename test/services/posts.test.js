import { describe, it, vi, expect, beforeAll, afterEach, afterAll } from 'vitest';
import db from '../../models/index.js';
import HttpError from '../../utils/http-error.js';

const { sequelize } = db;

describe('Posts serviсes', () => {
  let createPost = null;
  let updatePost = null;
  let getPosts = null;
  let deletePost = null;
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    // import services after sequelize run
    const postsServices = await import('../../services/posts.services.js');
    createPost = postsServices.createPost;
    updatePost = postsServices.updatePost;
    getPosts = postsServices.getPosts;
    deletePost = postsServices.deletePost;
  });

  afterEach(async () => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    await sequelize.truncate();
  });

  afterAll(async () => {
    await sequelize.close();
  });
  describe('createPost', () => {
    it('Should create a new post', async () => {
      const postData = {
        title: 'Test Post',
        slug: 'test-post',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        excerpt: 'Lorem ipsum dolor sit amet',
      };
      const post = await createPost(postData);
      expect(post.title).toBe(postData.title);
      expect(post.slug).toBe(postData.slug);
      expect(post.content).toBe(postData.content);
    });

    it('Should throw an error if validation failed', async () => {
      const postData = {
        title: '',
        slug: 'test-post',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        excerpt: 'Lorem ipsum dolor sit amet',
      };
      await expect(createPost(postData)).rejects.toThrow(HttpError);
    });

    it('should throw a 400 error if validation fails', async () => {
      const postData = {
        title: '',
        slug: 'test-post',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        excerpt: 'Lorem ipsum dolor sit amet',
      };
      expect.assertions(1);
      try {
        await createPost(postData);
      } catch (error) {
        expect(error.statusCode).toBe(400);
      }
    });

    it('should throw a message error "The slug should be an unique. Value [valueName] is already in use" and statusCode 409 if slug not unique', async () => {
      const postData1 = {
        title: 'Test Post 1',
        slug: 'test-post',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        excerpt: 'Lorem ipsum dolor sit amet',
      };
      const postData2 = {
        title: 'Test Post 2',
        slug: 'test-post',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        excerpt: 'Lorem ipsum dolor sit amet',
      };

      expect.assertions(2);
      await createPost(postData1);
      try {
        await createPost(postData2);
      } catch (error) {
        expect(error.message).toBe('The slug should be an unique. Value test-post is already in use');
        expect(error.statusCode).toBe(409);
      }
    });
  });

  describe('getPosts', () => {
    it('Should return all posts', async () => {
      const postData1 = {
        title: 'Test Post 1',
        slug: 'test-post-1',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        excerpt: 'Lorem ipsum dolor sit amet',
      };
      const postData2 = {
        title: 'Test Post 2',
        slug: 'test-post-2',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        excerpt: 'Lorem ipsum dolor sit amet',
      };

      await createPost(postData1);
      await createPost(postData2);

      const result = await getPosts();
      expect(result.count).toBe(2);
      expect(result.rows.length).toBe(2);
    });

    it('Should return an array of posts that match the query', async () => {
      const postData1 = {
        title: 'Test Post 1',
        slug: 'test-post-1',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        excerpt: 'Lorem ipsum dolor sit amet',
        status: 'published',
      };
      const postData2 = {
        title: 'Test Post 2',
        slug: 'test-post-2',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        excerpt: 'Lorem ipsum dolor sit amet',
        status: 'published',
      };
      const postData3 = {
        title: 'Test Post 3',
        slug: 'test-post-3',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        excerpt: 'Lorem ipsum dolor sit amet',
        status: 'draft',
      };
      const { Post } = db;

      await Post.bulkCreate([postData1, postData2, postData3]);

      const result = await getPosts({ status: 'published' });
      expect(result.count).toBe(2);
      expect(result.rows.length).toBe(2);
      expect(result.rows[0].status).toBe('published');
      expect(result.rows[1].status).toBe('published');
    });

    it('Should throw an error with message that sequelize provide and status code 500 if sequelize failed', async () => {
      const { Post } = db;
      vi.spyOn(Post, 'findAndCountAll');
      const errorMessage = 'Could not get posts';
      Post.findAndCountAll.mockRejectedValueOnce(new Error(errorMessage));
      expect.assertions(2);
      try {
        await getPosts();
      } catch (error) {
        expect(error.message).toBe(errorMessage);
        expect(error.statusCode).toBe(500);
      }
    });

    it('Should throw an error with message "Something went wrong" and statusCode 500 if unknown error occurred', async () => {
      const { Post } = db;
      vi.spyOn(Post, 'findAndCountAll');
      Post.findAndCountAll.mockRejectedValueOnce(new Error());
      expect.assertions(2);
      try {
        await getPosts();
      } catch (error) {
        expect(error.message).toBe('Something went wrong');
        expect(error.statusCode).toBe(500);
      }
    });
  });

  describe('updatePost', () => {
    it('Should update post successfully', async () => {
      const post = await createPost({
        title: 'Old Title',
        slug: 'old-title',
        content: 'Old Content',
        excerpt: 'Old Excerpt',
      });

      const toUpdate = { title: 'New Title', content: 'New Content', slug: 'new-title', excerpt: 'New Excerpt' };
      await updatePost(post.id, toUpdate);
      const result = await getPosts({ id: post.id });
      expect(result.rows[0].title).toBe(toUpdate.title);
      expect(result.rows[0].content).toBe(toUpdate.content);
      expect(result.rows[0].slug).toBe(toUpdate.slug);
      expect(result.rows[0].excerpt).toBe(toUpdate.excerpt);
    });

    it('Should call Post.fingByPk() and Post.update functions with arguments', async () => {
      const { Post } = db;
      vi.spyOn(Post, 'findByPk');
      vi.spyOn(Post, 'update');

      const mockPost = { id: 1, title: 'Old Title', content: 'Old Content' };
      Post.findByPk.mockResolvedValue(mockPost);
      Post.update.mockResolvedValue([1]);

      const updatedPost = { title: 'New Title', content: 'New Content' };
      await updatePost(mockPost.id, updatedPost);

      expect(Post.findByPk).toHaveBeenCalledWith(mockPost.id);
      expect(Post.update).toHaveBeenCalledWith(updatedPost, { where: { id: mockPost.id } });
    });

    it('Should throw an error if post to update is not found', async () => {
      const { Post } = db;
      vi.spyOn(Post, 'findByPk');

      Post.findByPk.mockResolvedValue(null);
      await expect(updatePost(1, {})).rejects.toThrow();
      expect(Post.findByPk).toHaveBeenCalledWith(1);
    });

    it('Sould throw an error with message "Post with this id not found" and status code 404 if post to update is not found', async () => {
      const { Post } = db;
      vi.spyOn(Post, 'findByPk');
      Post.findByPk.mockResolvedValue(null);
      expect.assertions(2);
      try {
        await updatePost(1, {});
      } catch (error) {
        expect(error.message).toBe('Post with this id not found');
        expect(error.statusCode).toBe(404);
      }
    });

    it('Should throw an error with message "Post was not updated" and status code 400 if post was not updated', async () => {
      expect.assertions(2);
      const { Post } = db;
      vi.spyOn(Post, 'findByPk');
      vi.spyOn(Post, 'update');

      Post.findByPk.mockResolvedValue({ id: 1 });
      Post.update.mockResolvedValue([0]);

      try {
        await updatePost(1, {});
      } catch (error) {
        expect(error.message).toBe('Post was not updated');
        expect(error.statusCode).toBe(400);
      }
    });

    it('Should throw an error that sequelize provide and status code 500 if sequelized failed', async () => {
      const { Post } = db;
      vi.spyOn(Post, 'findByPk');
      const errorMessage = 'Sequelize error';
      Post.findByPk.mockRejectedValue(new Error(errorMessage));

      try {
        await updatePost(1, {});
      } catch (error) {
        expect(error.message).toBe(errorMessage);
        expect(error.statusCode).toBe(500);
      }
    });

    it('Sould throw an error with message "Something went wrong" and status code 500 if unknown error occured', async () => {
      const { Post } = db;
      vi.spyOn(Post, 'findByPk');
      Post.findByPk.mockRejectedValue(new Error());

      try {
        await updatePost(1, {});
      } catch (error) {
        expect(error.message).toBe('Something went wrong');
        expect(error.statusCode).toBe(500);
      }
    });
  });

  describe('deletePost', () => {
    it('Should delete single post successfully', async () => {
      const post = await createPost({
        title: 'Test post',
        slug: 'test-post',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        excerpt: 'Lorem ipsum dolor sit amet',
      });
      const result = await deletePost(post.id);
      const posts = await getPosts();
      expect(result).toBe(1);
      expect(posts.count).toBe(0);
      expect(posts.rows.length).toBe(0);
    });

    it('Should delete multiple posts successfully', async () => {
      const post1 = await createPost({
        title: 'Test post 1',
        slug: 'test-post-1',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        excerpt: 'Lorem ipsum dolor sit amet',
      });

      const post2 = await createPost({
        title: 'Test post 2',
        slug: 'test-post-2',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        excerpt: 'Lorem ipsum dolor sit amet',
      });
      const result = await deletePost([post1.id, post2.id]);
      const posts = await getPosts();
      expect(result).toBe(2);
      expect(posts.count).toBe(0);
      expect(posts.rows.length).toBe(0);
    });

    it('Should throw an error with message "Post not found" or "Posts not found" and statusCode 404 if post(posts) to delete not found', async () => {
      expect.assertions(4);

      try {
        await deletePost(1);
      } catch (error) {
        expect(error.message).toBe('Post not found');
        expect(error.statusCode).toBe(404);
      }

      try {
        await deletePost([1, 2]);
      } catch (error) {
        expect(error.message).toBe('Posts not found');
        expect(error.statusCode).toBe(404);
      }
    });

    it('Should throw an error with message "Post was not deleted" and statusCode 400 if post was not deleted', async () => {
      expect.assertions(2);
      const { Post } = db;

      const post = await createPost({
        title: 'Test post',
        slug: 'test-post',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        excerpt: 'Lorem ipsum dolor sit amet',
      });

      vi.spyOn(Post, 'destroy').mockResolvedValueOnce(0);

      try {
        await deletePost(post.id);
      } catch (error) {
        expect(error.message).toBe('Post was not deleted');
        expect(error.statusCode).toBe(400);
      }
    });

    it('Should throw an error with provided message and statusCode 500 if sequelize failed', async () => {
      const { Post } = db;
      expect.assertions(2);
      const post = await createPost({
        title: 'Test post',
        slug: 'test-post',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        excerpt: 'Lorem ipsum dolor sit amet',
      });
      const errorMessage = 'Sequelize error';
      vi.spyOn(Post, 'destroy').mockRejectedValueOnce(new Error(errorMessage));

      try {
        await deletePost(post.id);
      } catch (error) {
        expect(error.message).toBe(errorMessage);
        expect(error.statusCode).toBe(500);
      }
    });

    it('Should throw an error with message "Something went wrong" and statusCode 500 if unknown error occurred', async () => {
      const { Post } = db;
      expect.assertions(2);
      const post = await createPost({
        title: 'Test post',
        slug: 'test-post',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        excerpt: 'Lorem ipsum dolor sit amet',
      });
      const errorMessage = 'Something went wrong';
      vi.spyOn(Post, 'destroy').mockRejectedValueOnce(new Error(errorMessage));

      try {
        await deletePost(post.id);
      } catch (error) {
        expect(error.message).toBe(errorMessage);
        expect(error.statusCode).toBe(500);
      }
    });
  });
});
