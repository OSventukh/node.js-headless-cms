import { Option } from '../models/index.js';
import HttpError from '../utils/http-error.js';

export const createOption = async (optionData) => {
  try {
    const option = await Option.create(optionData);
    return option;
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      throw new HttpError(error.message, 400);
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      const fieldName = Object.entries(error.fields)[0][0];
      const fieldValue = Object.entries(error.fields)[0][1];
      const errorMessage = `The ${fieldName} should be an unique. Name ${fieldValue} is already in use`;
      throw new HttpError(errorMessage, 409);
    }
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};

export const getOptions = async (
  whereQuery = {},
  orderQuery,
) => {
  try {
    // If parameter was provided, add it to sequelize where query
    const { id, name } = whereQuery;
    const result = await Option.findAll({
      where: {
        ...(id && { id }),
        ...(name && { name }),
      },
      order: [],
    });
    return result;
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};

export const updateOption = async (name, toUpdate) => {
  try {
    const option = await Option.findOne({
      where: {
        name,
      },
    });
    if (!option) {
      throw new HttpError('Option with this name not found', 404);
    }

    const result = await Option.update(toUpdate, {
      where: {
        name,
      },
    });
    if (result[0] === 0) {
      throw new HttpError('Option was not updated', 400);
    }
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};

export const deleteOption = async (name) => {
  try {
    const option = await Option.findOne({
      where: {
        name,
      },
    });

    if (!option || option.length === 0) {
      const errorMessage = 'Option not found';
      throw new HttpError(errorMessage, 404);
    }

    const result = await Option.update(
      {
        value: null,
      },
      {
        where: {
          name,
        },
      },
    );

    if (result[0] === 0) {
      throw new HttpError('Option was not deleted', 400);
    }

    return result;
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};
