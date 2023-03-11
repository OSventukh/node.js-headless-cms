import { validationResult } from 'express-validator';
import HttpError from '../utils/http-error.js';

export default function checkValidation(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError(`Please, enter valid ${errors.array()[0].param}`, 400));
  }
  return next();
}
