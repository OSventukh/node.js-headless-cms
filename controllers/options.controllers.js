import HttpError from '../utils/http-error.js';

import {
  getOptions,
  updateOption,
} from '../services/options.services.js';

export const getOptionsController = async (req, res, next) => {
  // Receive option name from url params or query
  const name = req.query.optionName;

  try {
    // get topics with provided parameters and response it to the client
    const { count, rows } = await getOptions({
      name,
      ...req.query,
    });
    res.status(200).json({
      count,
      options: rows,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const updateOptionController = async (req, res, next) => {
  // Divide the request body into data that will be updated and option id
  // Option name should reamin unchanged
  const { name, value } = req.body;

  // Receive option name from url params or request body
  const optionName = req.params.optionName || name;

  try {
    await updateOption(optionName, value);

    res.status(200).json({
      message: 'Option was successfully updated',
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};
