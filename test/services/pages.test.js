import { describe, it, vi, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { sequelize, Page } from '../../models/index.js';
import HttpError from '../../utils/http-error.js';

describe('Pages serviсes', () => {
  let createPage = null;
  let updatePage = null;
  let getPages = null;
  let deletePage = null;
  beforeAll(async () => {
    await sequelize.sync();
    vi.clearAllMocks();
    vi.resetAllMocks();
    // import services after sequelize run
    const pagesServices = await import('../../services/pages.services.js');
    createPage = pagesServices.createPage;
    updatePage = pagesServices.updatePage;
    getPages = pagesServices.getPages;
    deletePage = pagesServices.deletePage;
  });

  afterEach(async () => {
    await sequelize.truncate();
  });

  afterAll(async () => {
    await sequelize.close();
  });
  describe('createPage', () => {
    it('Should create a new page', async () => {
      const pageData = {
        title: 'Test Page',
        slug: 'test-page',
        description: 'Test page',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      };
      const page = await createPage(pageData);
      expect(page.title).toBe(pageData.title);
      expect(page.slug).toBe(pageData.slug);
      expect(page.content).toBe(pageData.content);
    });

    it('Should throw an error if validation failed', async () => {
      const pageData = {
        title: '',
        slug: 'test-page',
        description: 'Test page',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      };
      await expect(createPage(pageData)).rejects.toThrow(HttpError);
    });

    it('should throw a 400 error if validation fails', async () => {
      const pageData = {
        title: '',
        slug: 'test-page',
        description: 'Test page',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      };
      expect.assertions(1);
      try {
        await createPage(pageData);
      } catch (error) {
        expect(error.statusCode).toBe(400);
      }
    });

    it('should throw a message error "The slug should be an unique. Value [valueName] is already in use" and statusCode 409 if slug not unique', async () => {
      const pageData1 = {
        title: 'Test',
        slug: 'test-page',
        description: 'Test page',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      };
      const pageData2 = {
        title: 'Test2',
        slug: 'test-page',
        description: 'Test page 2',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      };

      expect.assertions(2);
      await createPage(pageData1);
      try {
        await createPage(pageData2);
      } catch (error) {
        expect(error.message).toBe('The slug should be an unique. Value test-page is already in use');
        expect(error.statusCode).toBe(409);
      }
    });
  });

  describe('getPages', () => {
    it('Should return all pages', async () => {
      const pageData1 = {
        title: 'Test page 1',
        slug: 'test-page-1',
        description: 'Test page',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      };
      const pageData2 = {
        title: 'Test page 2',
        slug: 'test-page-2',
        description: 'Test page',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      };

      await createPage(pageData1);
      await createPage(pageData2);

      const result = await getPages();
      expect(result.count).toBe(2);
      expect(result.rows.length).toBe(2);
    });

    it('Should return an array of pages that match the query', async () => {
      const pageData1 = {
        title: 'Page 1',
        slug: 'page-1',
        description: 'This is the first page',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        status: 'published',
      };
      const pageData2 = {
        title: 'Page 2',
        slug: 'page-2',
        description: 'This is the second page',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        status: 'published',
      };
      const pageData3 = {
        title: 'Page 3',
        slug: 'page-3',
        description: 'This is the third page',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        status: 'draft',
      };

      await Page.bulkCreate([pageData1, pageData2, pageData3]);

      const result = await getPages({ status: 'published' });
      expect(result.count).toBe(2);
      expect(result.rows.length).toBe(2);
      expect(result.rows[0].status).toBe('published');
      expect(result.rows[1].status).toBe('published');
    });

    it('Should throw an error with message that sequelize provide and status code 500 if sequelize failed', async () => {
      vi.spyOn(Page, 'findAndCountAll');
      const errorMessage = 'Could not get pages';
      Page.findAndCountAll.mockRejectedValueOnce(new Error(errorMessage));
      expect.assertions(2);
      try {
        await getPages();
      } catch (error) {
        expect(error.message).toBe(errorMessage);
        expect(error.statusCode).toBe(500);
      }
    });

    it('Should throw an error with message "Something went wrong" and statusCode 500 if unknown error occurred', async () => {
      vi.spyOn(Page, 'findAndCountAll');
      Page.findAndCountAll.mockRejectedValueOnce(new Error());
      expect.assertions(2);
      try {
        await getPages();
      } catch (error) {
        expect(error.message).toBe('Something went wrong');
        expect(error.statusCode).toBe(500);
      }
    });
  });

  describe('updatePage', () => {
    it('Should update page successfully', async () => {
      const page = await createPage({
        title: 'Old Title',
        slug: 'old-title',
        content: 'Old Content',
        description: 'Old Description',
      });

      const toUpdate = { title: 'New Title', content: 'New Content', slug: 'new-title', description: 'New Description' };
      await updatePage(page.id, toUpdate);
      const result = await getPages({ id: page.id });
      expect(result.rows[0].title).toBe(toUpdate.title);
      expect(result.rows[0].content).toBe(toUpdate.content);
      expect(result.rows[0].slug).toBe(toUpdate.slug);
      expect(result.rows[0].description).toBe(toUpdate.description);
    });

    it('Should call Page.fingByPk() and Page.update functions with arguments', async () => {
      vi.spyOn(Page, 'findByPk');
      vi.spyOn(Page, 'update');

      const mockPage = { id: 1, title: 'Old Title', content: 'Old Content' };
      Page.findByPk.mockResolvedValue(mockPage);
      Page.update.mockResolvedValue([1]);

      const updatedPage = { title: 'New Title', content: 'New Content' };
      await updatePage(mockPage.id, updatedPage);

      expect(Page.findByPk).toHaveBeenCalledWith(mockPage.id);
      expect(Page.update).toHaveBeenCalledWith(updatedPage, { where: { id: mockPage.id } });
    });

    it('Should throw an error if page to update is not found', async () => {
      vi.spyOn(Page, 'findByPk');

      Page.findByPk.mockResolvedValue(null);
      await expect(updatePage(1, {})).rejects.toThrow();
      expect(Page.findByPk).toHaveBeenCalledWith(1);
    });

    it('Sould throw an error with message "Page with this id not found" and status code 404 if page to update is not found', async () => {
      vi.spyOn(Page, 'findByPk');
      Page.findByPk.mockResolvedValue(null);
      expect.assertions(2);
      try {
        await updatePage(1, {});
      } catch (error) {
        expect(error.message).toBe('Page with this id not found');
        expect(error.statusCode).toBe(404);
      }
    });

    it('Should throw an error with message "Page was not updated" and status code 400 if page was not updated', async () => {
      expect.assertions(2);
      vi.spyOn(Page, 'findByPk');
      vi.spyOn(Page, 'update');

      Page.findByPk.mockResolvedValue({ id: 1 });
      Page.update.mockResolvedValue([0]);

      try {
        await updatePage(1, {});
      } catch (error) {
        expect(error.message).toBe('Page was not updated');
        expect(error.statusCode).toBe(400);
      }
    });

    it('Should throw an error that sequelize provide and status code 500 if sequelized failed', async () => {
      vi.spyOn(Page, 'findByPk');
      const errorMessage = 'Sequelize error';
      Page.findByPk.mockRejectedValue(new Error(errorMessage));

      try {
        await updatePage(1, {});
      } catch (error) {
        expect(error.message).toBe(errorMessage);
        expect(error.statusCode).toBe(500);
      }
    });

    it('Sould throw an error with message "Something went wrong" and status code 500 if unknown error occured', async () => {
      vi.spyOn(Page, 'findByPk');
      Page.findByPk.mockRejectedValue(new Error());

      try {
        await updatePage(1, {});
      } catch (error) {
        expect(error.message).toBe('Something went wrong');
        expect(error.statusCode).toBe(500);
      }
    });
  });

  describe('deletePage', () => {
    it('Should delete single post successfully', async () => {
      const page = await createPage({
        title: 'Test page',
        slug: 'test-page',
        description: 'Test page',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      });
      const result = await deletePage(page.id);
      const pages = await getPages();
      expect(result).toBe(1);
      expect(pages.count).toBe(0);
      expect(pages.rows.length).toBe(0);
    });

    it('Should delete multiple posts successfully', async () => {
      const page1 = await createPage({
        title: 'Test page 1',
        slug: 'test-page-1',
        description: 'Test page',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      });

      const page2 = await createPage({
        title: 'Test page 2',
        slug: 'test-page-2',
        description: 'Test page',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      });
      const result = await deletePage([page1.id, page2.id]);
      const pages = await getPages();
      expect(result).toBe(2);
      expect(pages.count).toBe(0);
      expect(pages.rows.length).toBe(0);
    });

    it('Should throw an error with message "Page not found" or "Pages not found" and statusCode 404 if page(pages) to delete not found', async () => {
      expect.assertions(4);

      try {
        await deletePage(1);
      } catch (error) {
        expect(error.message).toBe('Page not found');
        expect(error.statusCode).toBe(404);
      }

      try {
        await deletePage([1, 2]);
      } catch (error) {
        expect(error.message).toBe('Pages not found');
        expect(error.statusCode).toBe(404);
      }
    });

    it('Should throw an error with message "Page was not deleted" and statusCode 400 if page was not deleted', async () => {
      expect.assertions(2);

      const page = await createPage({
        title: 'Test page',
        slug: 'test-page',
        description: 'Test page',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      });

      vi.spyOn(Page, 'destroy').mockResolvedValueOnce(0);

      try {
        await deletePage(page.id);
      } catch (error) {
        expect(error.message).toBe('Page was not deleted');
        expect(error.statusCode).toBe(400);
      }
    });

    it('Should throw an error with provided message and statusCode 500 if sequelize failed', async () => {
      expect.assertions(2);
      const page = await createPage({
        title: 'Test page',
        slug: 'test-page',
        description: 'Test page',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      });
      const errorMessage = 'Sequelize error';
      vi.spyOn(Page, 'destroy').mockRejectedValueOnce(new Error(errorMessage));

      try {
        await deletePage(page.id);
      } catch (error) {
        expect(error.message).toBe(errorMessage);
        expect(error.statusCode).toBe(500);
      }
    });

    it('Should throw an error with message "Something went wrong" and statusCode 500 if unknown error occurred', async () => {
      expect.assertions(2);
      const page = await createPage({
        title: 'Test page',
        slug: 'test-page',
        description: 'Test page',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      });
      const errorMessage = 'Something went wrong';
      vi.spyOn(Page, 'destroy').mockRejectedValueOnce(new Error(errorMessage));

      try {
        await deletePage(page.id);
      } catch (error) {
        expect(error.message).toBe(errorMessage);
        expect(error.statusCode).toBe(500);
      }
    });
  });
});
