import HttpError from '../utils/http-error.js';

import {
  createOption,
  getOptions,
  updateOption,
  deleteOption,
} from '../services/options.services.js';

export const createOptionController = async (req, res, next) => {
  try {
    const option = await createOption(req.body);
    res.status(201).json({
      message: 'Option successfully created',
      option,
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const getOptionsController = async (req, res, next) => {
  // Receive option name from url params or query
  const name = req.params.optionName;

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
  // Receive option name from url params or request body
  const optionName = req.params.optionName || req.body.name;

  // Divide the request body into data that will be updated and option id
  // Option name should reamin unchanged
  const { name, ...toUpdate } = req.body;

  try {
    await updateOption(optionName, toUpdate);

    res.status(200).json({
      message: 'Option was successfully updated',
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};

export const deleteOptionController = async (req, res, next) => {
  // Receive option name from url param or request body
  const optionName = req.params.optionName || req.body.name;

  try {
    await deleteOption(optionName);

    res.status(200).json({
      message: 'Option was successfully deleted',
    });
  } catch (error) {
    next(new HttpError(error.message, error.statusCode));
  }
};
