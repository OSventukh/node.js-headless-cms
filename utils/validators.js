import { body, param, query } from 'express-validator';

const MIN_PASSWORD_LENGTH = 8;

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
    body('password').isStrongPassword({
      minLength: MIN_PASSWORD_LENGTH,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    }),
  ];
}

export function confirmUserValidator() {
  return [
    body('password')
      .isStrongPassword({
        minLength: MIN_PASSWORD_LENGTH,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.`
      ),
    body('confirmPassword')
      .custom((value, { req }) => value === req.body.password)
      .withMessage('d'),
  ];
}

export function resetPasswordValidator() {
  return [
    body('email')
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false })
      .withMessage('Please, enter a valid email'),
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
    body('rawContent')
      .optional()
      .trim()
      .not()
      .isEmpty()
      .withMessage('No content to save'),
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
