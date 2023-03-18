import { body, param, query } from 'express-validator';

export function loginValidator() {
  return [
    body('email').isEmail().normalizeEmail({ gmail_remove_dots: false }),
    body('password').trim(),
  ];
}

export function signupValidator() {
  return [
    body('firstname')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Firstname should not be an empty'),
    body('lastname').trim(),
    body('email')
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false })
      .withMessage('Please, enter a valid email'),
    body('password')
      .trim()
      .isLength({ min: 5 })
      .withMessage('Password should have at least 5 characters'),
  ];
}

export function userValidator() {
  return [
    body('firstname')
      .optional()
      .trim()
      .not()
      .isEmpty()
      .withMessage('Firstname should not be an empty'),
    body('lastname').optional().trim(),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false })
      .withMessage('Please, enter a valid email'),
    body('password')
      .optional()
      .trim()
      .isLength({ min: 5 })
      .withMessage('Password should have at least 5 characters'),
  ];
}

export function categoryValidator() {
  return [
    body('name')
      .optional()
      .trim()
      .not()
      .isEmpty()
      .withMessage('Category name should not be an empty'),
  ];
}

export function optionValidator() {
  return [
    body('name')
      .optional()
      .trim()
      .not()
      .isEmpty()
      .withMessage('Option name should not be an empty'),
  ];
}

export function pageValidator() {
  return [
    body('title')
      .optional()
      .trim()
      .not()
      .isEmpty()
      .withMessage('Title should not be an empty'),
  ];
}

export function postValidator() {
  return [
    body('title')
      .optional()
      .trim()
      .not()
      .isEmpty()
      .withMessage('Title should not be an empty'),
  ];
}

export function topicValidator() {
  return [
    body('title')
      .optional()
      .trim()
      .not()
      .isEmpty()
      .withMessage('Title should not be an empty'),
  ];
}

export function idValidator(id) {
  return [param(id).optional().isInt().escape()];
}

export function paginationValidator() {
  return [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('size').optional().isInt({ min: 1 }).toInt(),
  ];
}
