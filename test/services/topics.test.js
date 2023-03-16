import {
  describe,
  it,
  vi,
  expect,
  beforeAll,
  afterEach,
  afterAll,
} from 'vitest';
import { sequelize, Topic } from '../../models/index.js';
import HttpError from '../../utils/http-error.js';

describe('Topics serviсes', () => {
  let createTopic = null;
  let updateTopic = null;
  let getTopics = null;
  let deleteTopic = null;
  beforeAll(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
    await Topic.sync({ force: true });
    // import services after sequelize run
    const topicsServices = await import('../../services/topics.services.js');
    createTopic = topicsServices.createTopic;
    updateTopic = topicsServices.updateTopic;
    getTopics = topicsServices.getTopics;
    deleteTopic = topicsServices.deleteTopic;
  });

  afterEach(async () => {
    await Topic.destroy({ where: {}, force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('createTopic', () => {
    it('Should create a new topic', async () => {
      const topicData = {
        title: 'Test Topic',
        slug: 'test-topic',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        image: 'test.jpg',
      };
      const topic = await createTopic(topicData);
      expect(topic.title).toBe(topicData.title);
      expect(topic.slug).toBe(topicData.slug);
      expect(topic.content).toBe(topicData.content);
    });

    it('Should throw an error if validation failed', async () => {
      const topicData = {
        title: '',
        slug: 'test-topic',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        image: 'test.jpg',
      };
      await expect(createTopic(topicData)).rejects.toThrow(HttpError);
    });

    it('should throw a 400 error if validation fails', async () => {
      const topicData = {
        title: '',
        slug: 'test-topic',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        image: 'test.jpg',
      };
      expect.assertions(1);
      try {
        await createTopic(topicData);
      } catch (error) {
        expect(error.statusCode).toBe(400);
      }
    });

    it('should throw a message error "The slug should be an unique. Value [valueName] is already in use" and statusCode 409 if slug not unique', async () => {
      const topicData1 = {
        title: 'Test Topic 1',
        slug: 'test-topic',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        image: 'test.jpg',
      };
      const topicData2 = {
        title: 'Test Topic 2',
        slug: 'test-topic',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        image: 'test.jpg',
      };

      expect.assertions(2);
      await createTopic(topicData1);
      try {
        await createTopic(topicData2);
      } catch (error) {
        expect(error.message).toBe(
          'The slug should be an unique. Value test-topic is already in use',
        );
        expect(error.statusCode).toBe(409);
      }
    });
  });

  describe('getTopics', () => {
    it('Should return all topics', async () => {
      const topicData1 = {
        title: 'Test Topic 1',
        slug: 'test-topic-1',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        image: 'test.jpg',
      };
      const topicData2 = {
        title: 'Test Topic 2',
        slug: 'test-topic-2',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        image: 'test.jpg',
      };

      await createTopic(topicData1);
      await createTopic(topicData2);

      const result = await getTopics();
      expect(result.count).toBe(2);
      expect(result.rows.length).toBe(2);
    });

    it('Should return an array of topics that match the query', async () => {
      const topicData1 = {
        title: 'Test Topic 1',
        slug: 'test-topic-1',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        image: 'test.jpg',
        status: 'active',
      };
      const topicData2 = {
        title: 'Test Topic 2',
        slug: 'test-topic-2',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        image: 'test.jpg',
        status: 'active',
      };
      const topicData3 = {
        title: 'Test Topic 3',
        slug: 'test-topic-3',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        image: 'test.jpg',
        status: 'inactive',
      };

      await Topic.bulkCreate([topicData1, topicData2, topicData3]);

      const result = await getTopics({ status: 'active' });
      expect(result.count).toBe(2);
      expect(result.rows.length).toBe(2);
      expect(result.rows[0].status).toBe('active');
      expect(result.rows[1].status).toBe('active');
    });

    it('Should return an array with the correct order of records', async () => {
      const topicData1 = {
        title: 'Test Topic 1',
        slug: 'test-topic-1',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        image: 'test.jpg',
        status: 'active',
      };
      const topicData2 = {
        title: 'Test Topic 2',
        slug: 'test-topic-2',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        image: 'test.jpg',
        status: 'active',
      };
      const topicData3 = {
        title: 'Test Topic 3',
        slug: 'test-topic-3',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        image: 'test.jpg',
        status: 'inactive',
      };

      await Topic.bulkCreate([topicData1, topicData2, topicData3]);

      const result = await getTopics({}, '', 'id:desc');
      expect(result.rows[0].title).toBe(topicData3.title);
    });

    it('Should throw an error with message that sequelize provide and status code 500 if sequelize failed', async () => {
      vi.spyOn(Topic, 'findAndCountAll');
      const errorMessage = 'Could not get topics';
      Topic.findAndCountAll.mockRejectedValueOnce(new Error(errorMessage));
      expect.assertions(2);
      try {
        await getTopics();
      } catch (error) {
        expect(error.message).toBe(errorMessage);
        expect(error.statusCode).toBe(500);
      }
    });

    it('Should throw an error with message "Something went wrong" and statusCode 500 if unknown error occurred', async () => {
      vi.spyOn(Topic, 'findAndCountAll');
      Topic.findAndCountAll.mockRejectedValueOnce(new Error());
      expect.assertions(2);
      try {
        await getTopics();
      } catch (error) {
        expect(error.message).toBe('Something went wrong');
        expect(error.statusCode).toBe(500);
      }
    });
  });

  describe('updateTopic', () => {
    it('Should update topic successfully', async () => {
      const topic = await createTopic({
        title: 'Old Title',
        slug: 'old-title',
        description: 'Old Description',
        image: 'old-image.jpg',
      });

      const toUpdate = {
        title: 'New Title',
        description: 'New Description',
        slug: 'new-title',
        image: 'new-image.jpg',
      };
      await updateTopic(topic.id, toUpdate);
      const result = await getTopics({ id: topic.id });
      expect(result.rows[0].title).toBe(toUpdate.title);
      expect(result.rows[0].description).toBe(toUpdate.description);
      expect(result.rows[0].slug).toBe(toUpdate.slug);
      expect(result.rows[0].image).toBe(toUpdate.image);
    });

    it('Should call Topic.fingByPk, Topic.update and setCategories functions', async () => {
      vi.spyOn(Topic, 'findByPk');
      vi.spyOn(Topic, 'update');

      const mockTopic = {
        id: 1,
        title: 'Old Title',
        description: 'Old Description',
      };
      mockTopic.setCategories = vi.fn();
      Topic.findByPk.mockResolvedValue(mockTopic);
      Topic.update.mockResolvedValue([1]);

      const updatedTopic = {
        title: 'New Title',
        description: 'New Description',
      };
      await updateTopic(mockTopic.id, updatedTopic);

      expect(Topic.findByPk).toHaveBeenCalledOnce();
      expect(Topic.update).toHaveBeenCalledOnce();
      expect(mockTopic.setCategories).toHaveBeenCalledOnce();
    });

    it('Should throw an error if topic to update is not found', async () => {
      vi.spyOn(Topic, 'findByPk');

      Topic.findByPk.mockResolvedValue(null);
      await expect(updateTopic(1, {})).rejects.toThrow();
      expect(Topic.findByPk).toHaveBeenCalledWith(1);
    });

    it('Sould throw an error with message "Topic with this id not found" and status code 404 if topic to update is not found', async () => {
      vi.spyOn(Topic, 'findByPk');
      Topic.findByPk.mockResolvedValue(null);
      expect.assertions(2);
      try {
        await updateTopic(1, {});
      } catch (error) {
        expect(error.message).toBe('Topic with this id not found');
        expect(error.statusCode).toBe(404);
      }
    });

    it('Should throw an error with message "Topic was not updated" and status code 400 if topic was not updated', async () => {
      expect.assertions(2);

      vi.spyOn(Topic, 'findByPk');
      vi.spyOn(Topic, 'update');

      Topic.findByPk.mockResolvedValue({ id: 1, setCategories: vi.fn() });
      Topic.update.mockResolvedValue([0]);

      try {
        await updateTopic(1, {});
      } catch (error) {
        expect(error.message).toBe('Topic was not updated');
        expect(error.statusCode).toBe(400);
      }
    });

    it('Should throw an error that sequelize provide and status code 500 if sequelized failed', async () => {
      vi.spyOn(Topic, 'findByPk');
      const errorMessage = 'Sequelize error';
      Topic.findByPk.mockRejectedValue(new Error(errorMessage));

      try {
        await updateTopic(1, {});
      } catch (error) {
        expect(error.message).toBe(errorMessage);
        expect(error.statusCode).toBe(500);
      }
    });

    it('Sould throw an error with message "Something went wrong" and status code 500 if unknown error occured', async () => {
      vi.spyOn(Topic, 'findByPk');
      Topic.findByPk.mockRejectedValue(new Error());

      try {
        await updateTopic(1, {});
      } catch (error) {
        expect(error.message).toBe('Something went wrong');
        expect(error.statusCode).toBe(500);
      }
    });
  });

  describe('deleteTopic', () => {
    it('Should delete single topic successfully', async () => {
      const topic = await createTopic({
        title: 'Test Topic',
        slug: 'test-topic',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        image: 'test.jpg',
      });
      const result = await deleteTopic(topic.id);
      const topics = await getTopics();
      expect(result).toBe(1);
      expect(topics.count).toBe(0);
      expect(topics.rows.length).toBe(0);
    });

    it('Should delete multiple topics successfully', async () => {
      const topic1 = await createTopic({
        title: 'Test Topic 1',
        slug: 'test-topic-1',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        image: 'test.jpg',
      });

      const topic2 = await createTopic({
        title: 'Test Topic 2',
        slug: 'test-topic-2',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        image: 'test.jpg',
      });
      const result = await deleteTopic([topic1.id, topic2.id]);
      const topics = await getTopics();
      expect(result).toBe(2);
      expect(topics.count).toBe(0);
      expect(topics.rows.length).toBe(0);
    });

    it('Should throw an error with message "Topic not found" or "Topics not found" and statusCode 404 if topic(topics) to delete not found', async () => {
      expect.assertions(4);

      try {
        await deleteTopic(1);
      } catch (error) {
        expect(error.message).toBe('Topic not found');
        expect(error.statusCode).toBe(404);
      }

      try {
        await deleteTopic([1, 2]);
      } catch (error) {
        expect(error.message).toBe('Topics not found');
        expect(error.statusCode).toBe(404);
      }
    });

    it('Should throw an error with message "Topic was not deleted" and statusCode 400 if topic was not deleted', async () => {
      expect.assertions(2);

      const topic = await createTopic({
        title: 'Test Topic',
        slug: 'test-topic',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        image: 'test.jpg',
      });

      vi.spyOn(Topic, 'destroy').mockResolvedValueOnce(0);

      try {
        await deleteTopic(topic.id);
      } catch (error) {
        expect(error.message).toBe('Topic was not deleted');
        expect(error.statusCode).toBe(400);
      }
    });

    it('Should throw an error with provided message and statusCode 500 if sequelize failed', async () => {
      expect.assertions(2);
      const topic = await createTopic({
        title: 'Test Topic',
        slug: 'test-topic',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        image: 'test.jpg',
      });
      const errorMessage = 'Sequelize error';
      vi.spyOn(Topic, 'destroy').mockRejectedValueOnce(new Error(errorMessage));

      try {
        await deleteTopic(topic.id);
      } catch (error) {
        expect(error.message).toBe(errorMessage);
        expect(error.statusCode).toBe(500);
      }
    });

    it('Should throw an error with message "Something went wrong" and statusCode 500 if unknown error occurred', async () => {
      expect.assertions(2);
      const topic = await createTopic({
        title: 'Test Topic',
        slug: 'test-topic',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        image: 'test.jpg',
      });
      const errorMessage = 'Something went wrong';
      vi.spyOn(Topic, 'destroy').mockRejectedValueOnce(new Error(errorMessage));

      try {
        await deleteTopic(topic.id);
      } catch (error) {
        expect(error.message).toBe(errorMessage);
        expect(error.statusCode).toBe(500);
      }
    });
  });
});
