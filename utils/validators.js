import { body, param } from 'express-validator';

export function loginValidator() {
  return [
    body('email').isEmail().normalizeEmail({ gmail_remove_dots: false }),
    body('password').trim(),
  ];
}

export function userValidator() {
  return [
    body('firstname').optional().trim().not().isEmpty(),
    body('lastname').optional().trim(),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body('password').optional().trim().isLength({ min: 5 }),
  ];
}

export function categoryValidator() {
  return [body('name').optional().trim().not().isEmpty()];
}

export function optionValidator() {
  return [body('name').optional().trim().not().isEmpty()];
}

export function pageValidator() {
  return [body('title').optional().trim().not().isEmpty()];
}

export function postValidator() {
  return [body('title').optional().trim().not().isEmpty()];
}

export function topicValidator() {
  return [body('title').optional().trim().not().isEmpty()];
}

export function idValidator() {
  return [param('id').optional().optional().isInt().escape()];
}
