import { Op } from 'sequelize';
import db from '../models/index.js';
import HttpError from '../utils/http-error.js';
import {
  createPage,
  deletePage,
  getPages,
  updatePage,
} from '../services/page.service.js';

describe('Page service', () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  afterEach(async () => {
    await db.sequelize.truncate();
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  describe('createPage', () => {
    test('should create a new page', async () => {
      const pageData = {
        title: 'Test page',
        slug: 'test-page',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      };
      const result = await createPage(pageData);
      expect(result.title).toBe(pageData.title);
      expect(result.slug).toBe(pageData.slug);
      expect(result.content).toBe(pageData.content);
    });

    test('should throw an error if validation fails', async () => {
      const pageData = {
        title: '',
        slug: 'test-page',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      };
      await expect(createPage(pageData)).rejects.toThrow(HttpError);
    });

    test('should throw an error if slug is not unique', async () => {
      const pageData1 = {
        title: 'Test page',
        slug: 'test-page',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      };
      const pageData2 = {
        title: 'Another test page',
        slug: 'test-page',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      };
      await createPage(pageData1);
      await expect(createPage(pageData2)).rejects.toThrow(HttpError);
    });
  });

  describe('getPages', () => {
    test('should return all pages', async () => {
      const pageData1 = {
        title: 'Test page 1',
        slug: 'test-page-1',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      };
      const pageData2 = {
        title: 'Test page 2',
        slug: 'test-page-2',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      };
      await createPage(pageData1);
      await createPage(pageData2);
      const result = await getPages({}, [], [], 0, 10);
      expect(result.count).toBe(2);
    });

    test('should return pages with matching where query', async () => {
      const pageData1 = {
        title: 'Test page 1',
        slug: 'test-page-1',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      };
      const pageData2 = {
        title: 'Test page 2',
        slug: 'test-page-2',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        status: 'draft',
      };
      await createPage(pageData1);
      await createPage(pageData2);
      const result = await getPages({ status: 'draft' }, [], [], 0, 10);
      expect(result.count).toBe(1);
      expect(result.rows[0].title).toBe(pageData2.title);
    });

    test('should return pages with matching include query', async () => {
      // Define models with associations here
      const result = await getPages({}, [{}], [], 0, 10);

    })
  })
})

import { Op } from 'sequelize';
import db from '../models/index.js';
import HttpError from '../utils/http-error.js';
import {
  createPage,
  deletePage,
  getPages,
  updatePage,
} from '../services/page.service.js';

describe('Page service', () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  afterEach(async () => {
    await db.sequelize.truncate();
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  describe('createPage', () => {
    test('should create a new page', async () => {
      const pageData = {
        title: 'Test page',
        slug: 'test-page',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      };
      const result = await createPage(pageData);
      expect(result.title).toBe(pageData.title);
      expect(result.slug).toBe(pageData.slug);
      expect(result.content).toBe(pageData.content);
    });

    test('should throw an error if validation fails', async () => {
      const pageData = {
        title: '',
        slug: 'test-page',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      };
      await expect(createPage(pageData)).rejects.toThrow(HttpError);
    });

    test('should throw an error if slug is not unique', async () => {
      const pageData1 = {
        title: 'Test page',
        slug: 'test-page',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      };
      const pageData2 = {
        title: 'Another test page',
        slug: 'test-page',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      };
      await createPage(pageData1);
      await expect(createPage(pageData2)).rejects.toThrow(HttpError);
    });
  });

  describe('getPages', () => {
    test('should return all pages', async () => {
      const pageData1 = {
        title: 'Test page 1',
        slug: 'test-page-1',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      };
      const pageData2 = {
        title: 'Test page 2',
        slug: 'test-page-2',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      };
      await createPage(pageData1);
      await createPage(pageData2);
      const result = await getPages({}, [], [], 0, 10);
      expect(result.count).toBe(2);
    });

    test('should return pages with matching where query', async () => {
      const pageData1 = {
        title: 'Test page 1',
        slug: 'test-page-1',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      };
      const pageData2 = {
        title: 'Test page 2',
        slug: 'test-page-2',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        status: 'draft',
      };
      await createPage(pageData1);
      await createPage(pageData2);
      const result = await getPages({ status: 'draft' }, [], [], 0, 10);
      expect(result.count).toBe(1);
      expect(result.rows[0].title).toBe(pageData2.title);
    });

    test('should return pages with matching include query', async () => {
      // Define models with associations here
      const result = await getPages({}, [{}], [], 0, 10);
      import db from '../models/index.js';
      import {
        createPage,
        getPages,
        updatePage,
        deletePage,
      } from '../services/page.service.js';
      
      const { sequelize } = db;
      
      describe('Page Service', () => {
        beforeAll(async () => {
          await sequelize.sync({ force: true }); // очистити базу даних та створити таблиці
        });
      
        afterAll(async () => {
          await sequelize.close(); // закрити з'єднання з базою даних
        });
      
        describe('createPage', () => {
          it('should create a new page', async () => {
            const pageData = {
              title: 'Test Page',
              slug: 'test-page',
              content: '<p>This is a test page</p>',
              status: 'draft',
            };
            const result = await createPage(pageData);
            expect(result).toBeTruthy();
            expect(result.title).toBe(pageData.title);
            expect(result.slug).toBe(pageData.slug);
            expect(result.content).toBe(pageData.content);
            expect(result.status).toBe(pageData.status);
          });
      
          it('should throw an error when validation fails', async () => {
            const pageData = {}; // заборонено передавати порожні дані
            await expect(createPage(pageData)).rejects.toThrow('Validation error');
          });
      
          it('should throw an error when page with the same slug already exists', async () => {
            const pageData1 = {
              title: 'Test Page 1',
              slug: 'test-page-1',
              content: '<p>This is a test page 1</p>',
              status: 'draft',
            };
            const pageData2 = {
              title: 'Test Page 2',
              slug: 'test-page-1', // той самий slug, що і у pageData1
              content: '<p>This is a test page 2</p>',
              status: 'draft',
            };
            await createPage(pageData1);
            await expect(createPage(pageData2)).rejects.toThrow('unique');
          });
        });
      
        describe('getPages', () => {
          beforeAll(async () => {
            // додати кілька тестових сторінок до бази даних
            const pageData1 = {
              title: 'Test Page 1',
              slug: 'test-page-1',
              content: '<p>This is a test page 1</p>',
              status: 'draft',
            };
            const pageData2 = {
              title: 'Test Page 2',
              slug: 'test-page-2',
              content: '<p>This is a test page 2</p>',
              status: 'published',
            };
            const pageData3 = {
              title: 'Test Page 3',
              slug: 'test-page-3',
              content: '<p>This is a test page 3</p>',
              status: 'published',
            };
            await createPage(pageData1);
            await createPage(pageData2);
            await createPage(pageData3);
          });
      
          it('should get all pages', async () => {
            const result = await getPages({}, [], [], 0, 10);
            expect(result.count).toBe(3);
            expect(result.rows).toHaveLength(3);
          });
      
         
      