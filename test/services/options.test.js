import { describe, it, vi, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { sequelize, Option } from '../../models/index.js';
import HttpError from '../../utils/http-error.js';

describe('Options serviсes', () => {
  let createOption = null;
  let updateOption = null;
  let getOptions = null;
  beforeAll(async () => {
    await sequelize.sync();
    vi.clearAllMocks();
    vi.resetAllMocks();
    // import services after sequelize run
    const optionsServices = await import('../../services/options.services.js');
    createOption = optionsServices.createOption;
    updateOption = optionsServices.updateOption;
    getOptions = optionsServices.getOptions;
  });

  afterEach(async () => {
    await sequelize.truncate();
  });

  afterAll(async () => {
    await sequelize.close();
  });
  describe('createOption', () => {
    it('Should create a new option', async () => {
      const optionData = {
        name: 'site-name',
        value: 'Test name',
      };
      const option = await createOption(optionData);
      expect(option.name).toBe(optionData.name);
      expect(option.value).toBe(optionData.value);
    });

    it('Should throw an error if validation failed', async () => {
      const optionData = {
        name: '',
        value: 'Test name',
      };
      await expect(createOption(optionData)).rejects.toThrow(HttpError);
    });

    it('should throw a 400 error if validation fails', async () => {
      const optionData = {
        name: '',
        value: 'Test name',
      };
      expect.assertions(1);
      try {
        await createOption(optionData);
      } catch (error) {
        expect(error.statusCode).toBe(400);
      }
    });

    it('Should throw an error with "Option [option-name] is already in use" and statusCode 409 if option not unique', async () => {
      const optionData1 = {
        name: 'site-name',
        value: 'Test name',
      };
      const optionData2 = {
        name: 'site-name',
        value: 'Test name',
      };

      expect.assertions(2);
      await createOption(optionData1);
      try {
        await createOption(optionData2);
      } catch (error) {
        expect(error.message).toBe('Option "site-name" is already in use');
        expect(error.statusCode).toBe(409);
      }
    });
  });

  describe('getOptions', () => {
    it('Should return all options', async () => {
      const optionData1 = {
        name: 'site-name',
        value: 'Test name',
      };
      const optionData2 = {
        name: 'site-description',
        value: 'Test description',
      };

      await createOption(optionData1);
      await createOption(optionData2);

      const result = await getOptions();
      expect(result.length).toBe(2);
    });

    it('Should return an array of options that match the query', async () => {
      const optionData1 = {
        name: 'site-name',
        value: 'Test name',
      };
      const optionData2 = {
        name: 'site-description',
        value: 'Test description',
      };

      const optionData3 = {
        name: 'favicon',
        value: 'favicon.ico',
      };

      await Option.bulkCreate([optionData1, optionData2, optionData3]);

      const result = await getOptions({ name: 'favicon' });
      expect(result.length).toBe(1);
      expect(result[0].value).toBe('favicon.ico');
    });

    it('Should throw an error with message that sequelize provide and status code 500 if sequelize failed', async () => {
      vi.spyOn(Option, 'findAll');
      const errorMessage = 'Could not get options';
      Option.findAll.mockRejectedValueOnce(new Error(errorMessage));
      expect.assertions(2);
      try {
        await getOptions();
      } catch (error) {
        expect(error.message).toBe(errorMessage);
        expect(error.statusCode).toBe(500);
      }
    });

    it('Should throw an error with message "Something went wrong" and statusCode 500 if unknown error occurred', async () => {
      vi.spyOn(Option, 'findAll');
      Option.findAll.mockRejectedValueOnce(new Error());
      expect.assertions(2);
      try {
        await getOptions();
      } catch (error) {
        expect(error.message).toBe('Something went wrong');
        expect(error.statusCode).toBe(500);
      }
    });
  });

  describe('updateOption', () => {
    it('Should update option value successfully', async () => {
      const option = await createOption({
        name: 'site-name',
        value: 'Old Name',
      });

      const toUpdate = { name: 'site-name', value: 'New Name' };
      await updateOption(option.name, toUpdate.value);
      const result = await getOptions({ name: option.name });
      expect(result[0].value).toBe(toUpdate.value);
    });

    it('Should not update option name', async () => {
      const option = await createOption({
        name: 'site-name',
        value: 'Test Name',
      });

      const toUpdate = { name: 'best-site-name', value: 'Test Name' };
      await updateOption(option.name, toUpdate.name);
      const result = await getOptions({ name: option.name });
      expect(result[0].name).toBe(option.name);
    });

    it('Should call Option.findOne() and Option.update functions with arguments', async () => {
      vi.spyOn(Option, 'findOne');
      vi.spyOn(Option, 'update');

      const mockOption = { id: 1, name: 'site-name', value: 'Test Name' };
      Option.findOne.mockResolvedValue(mockOption.name);
      Option.update.mockResolvedValue([1]);

      const updatedOption = { name: 'site-name', value: 'New Name' };
      await updateOption(mockOption.name, updatedOption.value);

      expect(Option.findOne).toHaveBeenCalledWith({ where: { name: mockOption.name } });
      expect(Option.update).toHaveBeenCalledWith({
        value: updatedOption.value }, { where: { name: mockOption.name },
      });
    });

    it('Should throw an error if option to update is not found', async () => {
      vi.spyOn(Option, 'findOne');

      Option.findOne.mockResolvedValue(null);
      await expect(updateOption(1, {})).rejects.toThrow();
    });

    it('Sould throw an error with message "Option with this id not found" and status code 404 if option to update is not found', async () => {
      vi.spyOn(Option, 'findByPk');
      Option.findByPk.mockResolvedValue(null);
      expect.assertions(2);
      try {
        await updateOption(1, {});
      } catch (error) {
        expect(error.message).toBe('Option with this name not found');
        expect(error.statusCode).toBe(404);
      }
    });

    it('Should throw an error with message "Option was not updated" and status code 400 if option was not updated', async () => {
      expect.assertions(2);
      vi.spyOn(Option, 'findOne');
      vi.spyOn(Option, 'update');

      Option.findOne.mockResolvedValue({ id: 1, name: 'site-name', value: 'Test Name' });
      Option.update.mockResolvedValue([0]);

      try {
        await updateOption({ value: 'New Name' }, { name: 'site-name' });
      } catch (error) {
        expect(error.message).toBe('Option was not updated');
        expect(error.statusCode).toBe(400);
      }
    });

    it('Should throw an error that sequelize provide and status code 500 if sequelized failed', async () => {
      vi.spyOn(Option, 'findOne');
      const errorMessage = 'Sequelize error';
      Option.findOne.mockRejectedValue(new Error(errorMessage));

      try {
        await updateOption({ value: 'New Site Name' }, { name: 'site-name' });
      } catch (error) {
        expect(error.message).toBe(errorMessage);
        expect(error.statusCode).toBe(500);
      }
    });

    it('Sould throw an error with message "Something went wrong" and status code 500 if unknown error occured', async () => {
      vi.spyOn(Option, 'findOne');
      Option.findOne.mockRejectedValue(new Error());

      try {
        await updateOption({ value: 'New Site Name' }, { name: 'site-name' });
      } catch (error) {
        expect(error.message).toBe('Something went wrong');
        expect(error.statusCode).toBe(500);
      }
    });
  });
});
