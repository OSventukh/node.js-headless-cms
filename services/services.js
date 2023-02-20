import HttpError from '../utils/http-error.js';

export const createService = async (Model, data) => {
  try {
    const result = await Model.create(data);
    return result;
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      throw new HttpError(error.message, 400);
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new HttpError(error.message, 409);
    }
    throw new HttpError(error.message || 'Something went wrong', 500);
  }
};

export const getService = async (
  Model,
  whereOptions = {},
  includeOptions = [],
  orderOptions = [],
) => {
  try {
    const result = await Model.findAll({
      where: whereOptions,
      include: includeOptions,
      order: orderOptions,
    });
    return result;
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', 500);
  }
};

export const updateService = async (Model, toUpdate, whereOptions) => {
  try {
    const result = Model.update(toUpdate, {
      where: whereOptions,
    });

    if (result[0] === 0) {
      throw new HttpError('Could not update this topic', 500);
    }
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      throw new HttpError(error.message, 400);
    }
    throw new HttpError(error.message || 'Something went wrong', 500);
  }
};

export const deleteService = async (Model, whereOptions) => {
  try {
    await Model.destroy({
      where: whereOptions,
    });
  } catch (error) {
    throw new HttpError(error.message || 'Something went wrong', 500);
  }
};
