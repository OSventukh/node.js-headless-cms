import {
  describe,
  it,
  vi,
  expect,
  beforeAll,
  afterEach,
  afterAll,
  beforeEach,
} from 'vitest';
import { sequelize, Post, Category, Topic } from '../../models/index.js';
import HttpError from '../../utils/http-error.js';

describe('Posts serviсes', () => {
  let createPost = null;
  let updatePost = null;
  let getPosts = null;
  let deletePost = null;
  let topic;
  let category;
  beforeAll(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
    await Post.sync({ alter: true, logging: false });
    await Topic.sync({ force: true, logging: false });
    await Category.sync({ force: true, logging: false });
    // import services after sequelize run
    const postsServices = await import('../../services/posts.services.js');
    createPost = postsServices.createPost;
    updatePost = postsServices.updatePost;
    getPosts = postsServices.getPosts;
    deletePost = postsServices.deletePost;
  });

  beforeEach(async () => {
    const [newTopic, newCategory] = await Promise.all(
      [
        Topic.create({
          title: 'Test topic',
          slug: 'test-topic',
        }),
        Category.create({
          name: 'Test category',
          slug: 'test-category',
        }),
      ],
    );
    topic = newTopic;
    category = newCategory;
  });
  afterEach(async () => {
    await Post.destroy({ where: {}, force: true });
    await Topic.destroy({ where: {}, force: true });
    await Category.destroy({ where: {}, force: true });

    vi.clearAllMocks();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('createPost', () => {
    it('Should create a new post', async () => {
      const title = 'Test title';
      const content = '<p>Test content</p>';

      const postData = {
        slug: 'test-post',
        rawContent: `<h1>${title}</h1>${content}`,
        topicId: topic.id,
        categoryId: category.id,
      };

      const post = await createPost(postData);
      expect(post.title).toBe(title);
      expect(post.slug).toBe(postData.slug);
      expect(post.content).toBe(content);
    });

    it('Should throw an error if validation failed', async () => {
      const title = '';
      const content = '<p>Test content</p>';

      const postData = {
        slug: 'test-post',
        rawContent: `<h1>${title}</h1>${content}`,
        topicId: topic.id,
        categoryId: category.id,
      };
      await expect(createPost(postData)).rejects.toThrow(HttpError);
    });

    it('Should throw a 400 error if validation failed', async () => {
      const title = '';
      const content = '<p>Test content</p>';

      const postData = {
        rawContent: `<h1>${title}</h1>${content}`,
        topicId: topic.id,
        categoryId: category.id,
      };
      expect.assertions(1);
      try {
        await createPost(postData);
      } catch (error) {
        expect(error.statusCode).toBe(400);
      }
    });

    it('Should throw a message error "The slug should be an unique. Value [valueName] is already in use" and statusCode 409 if slug not unique', async () => {
      const title = 'Test Title';
      const content = '<p>Test content</p>';

      const postData1 = {
        rawContent: `<h1>${title}</h1>${content}`,
        slug: 'test-post',
        topicId: topic.id,
        categoryId: category.id,
      };

      const postData2 = {
        rawContent: `<h1>${title}2</h1>${content}`,
        slug: 'test-post',
        topicId: topic.id,
        categoryId: category.id,
      };

      expect.assertions(2);
      await createPost(postData1);
      try {
        await createPost(postData2);
      } catch (error) {
        expect(error.message).toBe(
          'The slug should be an unique. Value test-post is already in use',
        );
        expect(error.statusCode).toBe(409);
      }
    });
  });

  describe('getPosts', () => {
    it('Should return all posts', async () => {
      const postData1 = {
        rawContent: '<h1>Test title</h1><p>Test content</p>',
        slug: 'test-post-1',
        topicId: topic.id,
        categoryId: category.id,
      };
      const postData2 = {
        rawContent: '<h1>Test title2</h1><p>Test content</p>',
        slug: 'test-post-2',
        topicId: topic.id,
        categoryId: category.id,
      };

      await createPost(postData1);
      await createPost(postData2);

      const result = await getPosts();
      expect(result.count).toBe(2);
      expect(result.rows.length).toBe(2);
    });

    it('Should return an array of posts that match the query', async () => {
      const postData1 = {
        title: 'Test title',
        content: 'Test content',
        excerpt: 'Test excerpt',
        slug: 'test-post-1',
        topicId: topic.id,
        categoryId: category.id,
        status: 'published',
      };
      const postData2 = {
        title: 'Test title',
        excerpt: 'Test excerpt',
        content: 'Test content',
        slug: 'test-post-2',
        topicId: topic.id,
        categoryId: category.id,
        status: 'published',
      };
      const postData3 = {
        title: 'Test title',
        excerpt: 'Test excerpt',
        content: 'Test content',
        slug: 'test-post-3',
        topicId: topic.id,
        categoryId: category.id,
        status: 'draft',
      };

      await Post.bulkCreate([postData1, postData2, postData3]);

      const result = await getPosts({ status: 'published' });
      expect(result.count).toBe(2);
      expect(result.rows.length).toBe(2);
      expect(result.rows[0].status).toBe('published');
      expect(result.rows[1].status).toBe('published');
    });

    it('Should return an array with the correct order of records', async () => {
      const postData1 = {
        title: 'Test title',
        excerpt: 'Test excerpt',
        content: 'Test content',
        slug: 'test-post-1',
        topicId: topic.id,
        categoryId: category.id,
        status: 'published',
      };
      const postData2 = {
        title: 'Test title',
        excerpt: 'Test excerpt',
        content: 'Test content',
        slug: 'test-post-2',
        topicId: topic.id,
        categoryId: category.id,
        status: 'published',
      };
      const postData3 = {
        title: 'Test title',
        excerpt: 'Test excerpt',
        content: 'Test content',
        slug: 'test-post-3',
        topicId: topic.id,
        categoryId: category.id,
        status: 'published',
      };

      await Post.bulkCreate([postData1, postData2, postData3]);

      const result = await getPosts({}, '', 'id:desc');
      expect(result.rows[0].title).toBe(postData3.title);
    });

    it('Should throw an error with message that sequelize provide and status code 500 if sequelize failed', async () => {
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
        rawContent: '<h1>Old title</h1><p>Old content</p>',
        slug: 'old-slug',
        topicId: topic.id,
        categoryId: category.id,
        status: 'draft',
      });

      const toUpdate = {
        rawContent: '<h1>Test title</h1><p>Test content</p>',
        slug: 'new-slug',
        topicId: topic.id,
        categoryId: category.id,
        status: 'published',
      };

      await updatePost(post.id, toUpdate);
      const result = await getPosts({ id: post.id });
      expect(result.rows[0].title).toBe(toUpdate.rawContent.match(/<h1>(.*?)<\/h1>/)[1]);
      expect(result.rows[0].content).toBe(toUpdate.rawContent.replace(/<h1>.*?<\/h1>/, ''));
      expect(result.rows[0].slug).toBe(toUpdate.slug);
      expect(result.rows[0].status).toBe(toUpdate.status);
    });

    it('Should call Post.findByPk, Post.update, setCategories and setTopics functions', async () => {
      vi.spyOn(Post, 'findByPk');
      vi.spyOn(Post, 'update');

      const mockPost = { id: 1, title: 'Old Title', content: 'Old Content', categoriesId: 1, topicsId: 1 };
      mockPost.setCategories = vi.fn();
      mockPost.setTopics = vi.fn();
      Post.findByPk.mockResolvedValue(mockPost);
      Post.update.mockResolvedValue([1]);
      const updatedPost = { rawContent: '<h1>New Title</h1><p>New Content</p>' };
      await updatePost(mockPost.id, updatedPost);

      expect(Post.findByPk).toHaveBeenCalledOnce();
      expect(mockPost.setCategories).toHaveBeenCalled();
      expect(mockPost.setTopics).toHaveBeenCalled();
      expect(Post.update).toHaveBeenCalledOnce();
    });

    it('Should throw an error if post to update is not found', async () => {
      vi.spyOn(Post, 'findByPk');

      Post.findByPk.mockResolvedValue(null);
      await expect(updatePost(1, {})).rejects.toThrow();
      expect(Post.findByPk).toHaveBeenCalledWith(1);
    });

    it('Sould throw an error with message "Post with this id not found" and status code 404 if post to update is not found', async () => {
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
      vi.spyOn(Post, 'findByPk');
      vi.spyOn(Post, 'update');

      Post.findByPk.mockResolvedValue({ id: 1, setCategories: vi.fn(), setTopics: vi.fn() });
      Post.update.mockResolvedValue([0]);

      try {
        await updatePost(1, { rawContent: '<h1>Title</h1>' });
      } catch (error) {
        expect(error.message).toBe('Post was not updated');
        expect(error.statusCode).toBe(400);
      }
    });

    it('Should throw an error that sequelize provide and status code 500 if sequelized failed', async () => {
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

    it('Should throw an error with message "Something went wrong" and status code 500 if unknown error occured', async () => {
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
        rawContent: '<h1>Test title</h1><p>Test content</p>',
        slug: 'test-post',
        topicId: topic.id,
        categoryId: category.id,
      });
      const result = await deletePost(post.id);
      const posts = await getPosts();
      expect(result).toBe(1);
      expect(posts.count).toBe(0);
      expect(posts.rows.length).toBe(0);
    });

    it('Should delete multiple posts successfully', async () => {
      const post1 = await createPost({
        rawContent: '<h1>Test title</h1><p>Test content</p>',
        slug: 'test-post-1',
        topicId: topic.id,
        categoryId: category.id,
      });

      const post2 = await createPost({
        rawContent: '<h1>Test title</h1><p>Test content</p>',
        slug: 'test-post-2',
        topicId: topic.id,
        categoryId: category.id,
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

      const post = await createPost({
        rawContent: '<h1>Test title</h1><p>Test content</p>',
        slug: 'test-post',
        topicId: topic.id,
        categoryId: category.id,
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
      expect.assertions(2);
      const post = await createPost({
        rawContent: '<h1>Test title</h1><p>Test content</p>',
        slug: 'test-post',
        topicId: topic.id,
        categoryId: category.id,
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
      expect.assertions(2);
      const post = await createPost({
        rawContent: '<h1>Test title</h1><p>Test content</p>',
        slug: 'test-post',
        topicId: topic.id,
        categoryId: category.id,
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
