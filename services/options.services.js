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
      const fieldValue = Object.entries(error.fields)[0][1];
      const errorMessage = `Option "${fieldValue}" is already in use`;
      throw new HttpError(errorMessage, 409);
    }
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};

export const getOptions = async (whereQuery = {}) => {
  try {
    // If parameter was provided, add it to sequelize where query
    const { id, name } = whereQuery;
    const result = await Option.findAll({
      where: {
        ...(id && { id }),
        ...(name && { name }),
      },
    });
    return result;
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};

export const updateOption = async (name, updatedValue) => {
  try {
    const option = await Option.findOne({
      where: {
        name,
      },
    });
    if (!option) {
      throw new HttpError('Option with this name not found', 404);
    }

    const result = await Option.update(
      { value: updatedValue },
      {
        where: {
          name,
        },
      },
    );
    if (result[0] === 0) {
      throw new HttpError('Option was not updated', 400);
    }
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', error.statusCode || 500);
  }
};
