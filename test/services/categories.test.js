import { describe, it, vi, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { sequelize, Category } from '../../models/index.js';
import HttpError from '../../utils/http-error.js';

describe('Categories serviсes', () => {
  let createCategory = null;
  let updateCategory = null;
  let getCategories = null;
  let deleteCategory = null;
  beforeAll(async () => {
    await sequelize.sync();
    vi.clearAllMocks();
    vi.resetAllMocks();
    // import services after sequelize run
    const categoriesServices = await import('../../services/categories.services.js');
    createCategory = categoriesServices.createCategory;
    updateCategory = categoriesServices.updateCategory;
    getCategories = categoriesServices.getCategories;
    deleteCategory = categoriesServices.deleteCategory;
  });

  afterEach(async () => {
    await sequelize.truncate();
  });

  afterAll(async () => {
    await sequelize.close();
  });
  describe('createCategory', () => {
    it('Should create a new category', async () => {
      const categoryData = {
        name: 'Test category',
        slug: 'test-category',
      };
      const category = await createCategory(categoryData);
      expect(category.title).toBe(categoryData.title);
      expect(category.slug).toBe(categoryData.slug);
      expect(category.content).toBe(categoryData.content);
    });

    it('Should throw an error if validation failed', async () => {
      const categoryData = {
        name: '',
        slug: 'test-category',
      };
      await expect(createCategory(categoryData)).rejects.toThrow(HttpError);
    });

    it('Should throw a 400 error if validation fails', async () => {
      const categoryData = {
        name: '',
        slug: 'test-category',
      };
      expect.assertions(1);
      try {
        await createCategory(categoryData);
      } catch (error) {
        expect(error.statusCode).toBe(400);
      }
    });

    it('should throw a message error "The slug should be an unique. Value [valueName] is already in use" and statusCode 409 if slug not unique', async () => {
      const categoryData1 = {
        name: 'Test category',
        slug: 'test-category',
      };
      const categoryData2 = {
        name: 'Test category 2',
        slug: 'test-category',
      };

      expect.assertions(2);
      await createCategory(categoryData1);
      try {
        await createCategory(categoryData2);
      } catch (error) {
        expect(error.message).toBe('The slug should be an unique. Value test-category is already in use');
        expect(error.statusCode).toBe(409);
      }
    });
  });

  describe('getCategories', () => {
    it('Should return all categories', async () => {
      const categoryData1 = {
        name: 'Test category',
        slug: 'test-category',
      };
      const categoryData2 = {
        name: 'Test category 2',
        slug: 'test-category-2',
      };

      await createCategory(categoryData1);
      await createCategory(categoryData2);

      const result = await getCategories();
      expect(result.count).toBe(2);
      expect(result.rows.length).toBe(2);
    });

    it('Should return an array of categories that match the query', async () => {
      const categoryData1 = {
        name: 'Test category',
        slug: 'test-category',
      };
      const categoryData2 = {
        name: 'Test category 2',
        slug: 'test-category-2',
      };
      const categoryData3 = {
        name: 'Test category 3',
        slug: 'test-category-3',
      };

      await Category.bulkCreate([categoryData1, categoryData2, categoryData3]);

      const result = await getCategories({ name: 'Test category 3' });
      expect(result.count).toBe(1);
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].name).toBe('Test category 3');
    });

    it('Should throw an error with message that sequelize provide and status code 500 if sequelize failed', async () => {
      vi.spyOn(Category, 'findAndCountAll');
      const errorMessage = 'Could not get categories';
      Category.findAndCountAll.mockRejectedValueOnce(new Error(errorMessage));
      expect.assertions(2);
      try {
        await getCategories();
      } catch (error) {
        expect(error.message).toBe(errorMessage);
        expect(error.statusCode).toBe(500);
      }
    });

    it('Should throw an error with message "Something went wrong" and statusCode 500 if unknown error occurred', async () => {
      vi.spyOn(Category, 'findAndCountAll');
      Category.findAndCountAll.mockRejectedValueOnce(new Error());
      expect.assertions(2);
      try {
        await getCategories();
      } catch (error) {
        expect(error.message).toBe('Something went wrong');
        expect(error.statusCode).toBe(500);
      }
    });
  });

  describe('updateCategory', () => {
    it('Should update category successfully', async () => {
      const category = await createCategory({
        name: 'Old Category Name',
        slug: 'old-category-name',
      });

      const toUpdate = { name: 'New Category Name', slug: 'new-category-name' };
      await updateCategory(category.id, toUpdate);
      const result = await getCategories({ id: category.id });
      expect(result.rows[0].name).toBe(toUpdate.name);
      expect(result.rows[0].slug).toBe(toUpdate.slug);
    });

    it('Should call Category.fingByPk() and Category.update functions with arguments', async () => {
      vi.spyOn(Category, 'findByPk');
      vi.spyOn(Category, 'update');

      const mockCategory = { id: 1, title: 'Old Title', content: 'Old Content' };
      Category.findByPk.mockResolvedValue(mockCategory);
      Category.update.mockResolvedValue([1]);

      const updatedCategory = { title: 'New Title', content: 'New Content' };
      await updateCategory(mockCategory.id, updatedCategory);

      expect(Category.findByPk).toHaveBeenCalledWith(mockCategory.id);
      expect(Category.update).toHaveBeenCalledWith(updatedCategory, {
        where: { id: mockCategory.id },
      });
    });

    it('Should throw an error if category to update is not found', async () => {
      vi.spyOn(Category, 'findByPk');

      Category.findByPk.mockResolvedValue(null);
      await expect(updateCategory(1, {})).rejects.toThrow();
      expect(Category.findByPk).toHaveBeenCalledWith(1);
    });

    it('Sould throw an error with message "Category with this id not found" and status code 404 if category to update is not found', async () => {
      vi.spyOn(Category, 'findByPk');
      Category.findByPk.mockResolvedValue(null);
      expect.assertions(2);
      try {
        await updateCategory(1, {});
      } catch (error) {
        expect(error.message).toBe('Category with this id not found');
        expect(error.statusCode).toBe(404);
      }
    });

    it('Should throw an error with message "Category was not updated" and status code 400 if category was not updated', async () => {
      expect.assertions(2);
      vi.spyOn(Category, 'findByPk');
      vi.spyOn(Category, 'update');

      Category.findByPk.mockResolvedValue({ id: 1 });
      Category.update.mockResolvedValue([0]);

      try {
        await updateCategory(1, {});
      } catch (error) {
        expect(error.message).toBe('Category was not updated');
        expect(error.statusCode).toBe(400);
      }
    });

    it('Should throw an error that sequelize provide and status code 500 if sequelized failed', async () => {
      vi.spyOn(Category, 'findByPk');
      const errorMessage = 'Sequelize error';
      Category.findByPk.mockRejectedValue(new Error(errorMessage));

      try {
        await updateCategory(1, {});
      } catch (error) {
        expect(error.message).toBe(errorMessage);
        expect(error.statusCode).toBe(500);
      }
    });

    it('Sould throw an error with message "Something went wrong" and status code 500 if unknown error occured', async () => {
      vi.spyOn(Category, 'findByPk');
      Category.findByPk.mockRejectedValue(new Error());

      try {
        await updateCategory(1, {});
      } catch (error) {
        expect(error.message).toBe('Something went wrong');
        expect(error.statusCode).toBe(500);
      }
    });
  });

  describe('deleteCategory', () => {
    it('Should delete single post successfully', async () => {
      const category = await createCategory({
        name: 'Test category',
        slug: 'test-category',
      });
      const result = await deleteCategory(category.id);
      const categories = await getCategories();
      expect(result).toBe(1);
      expect(categories.count).toBe(0);
      expect(categories.rows.length).toBe(0);
    });

    it('Should delete multiple posts successfully', async () => {
      const category1 = await createCategory({
        name: 'Test category',
        slug: 'test-category',
      });

      const category2 = await createCategory({
        name: 'Test category 2',
        slug: 'test-category-2',
      });
      const result = await deleteCategory([category1.id, category2.id]);
      const categories = await getCategories();
      expect(result).toBe(2);
      expect(categories.count).toBe(0);
      expect(categories.rows.length).toBe(0);
    });

    it('Should throw an error with message "Category not found" or "Categories not found" and statusCode 404 if category(categories) to delete not found', async () => {
      expect.assertions(4);

      try {
        await deleteCategory(1);
      } catch (error) {
        expect(error.message).toBe('Category not found');
        expect(error.statusCode).toBe(404);
      }

      try {
        await deleteCategory([1, 2]);
      } catch (error) {
        expect(error.message).toBe('Categories not found');
        expect(error.statusCode).toBe(404);
      }
    });

    it('Should throw an error with message "Category was not deleted" and statusCode 400 if category was not deleted', async () => {
      expect.assertions(2);

      const category = await createCategory({
        name: 'Test category',
        slug: 'test-category',
      });

      vi.spyOn(Category, 'destroy').mockResolvedValueOnce(0);

      try {
        await deleteCategory(category.id);
      } catch (error) {
        expect(error.message).toBe('Category was not deleted');
        expect(error.statusCode).toBe(400);
      }
    });

    it('Should throw an error with provided message and statusCode 500 if sequelize failed', async () => {
      expect.assertions(2);
      const category = await createCategory({
        name: 'Test category',
        slug: 'test-category',
      });
      const errorMessage = 'Sequelize error';
      vi.spyOn(Category, 'destroy').mockRejectedValueOnce(new Error(errorMessage));

      try {
        await deleteCategory(category.id);
      } catch (error) {
        expect(error.message).toBe(errorMessage);
        expect(error.statusCode).toBe(500);
      }
    });

    it('Should throw an error with message "Something went wrong" and statusCode 500 if unknown error occurred', async () => {
      expect.assertions(2);
      const category = await createCategory({
        name: 'Test category',
        slug: 'test-category',
      });
      const errorMessage = 'Something went wrong';
      vi.spyOn(Category, 'destroy').mockRejectedValueOnce(new Error(errorMessage));

      try {
        await deleteCategory(category.id);
      } catch (error) {
        expect(error.message).toBe(errorMessage);
        expect(error.statusCode).toBe(500);
      }
    });
  });
});
