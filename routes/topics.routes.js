import express from 'express';

const router = express.Router();

router.get('/topics', (req, res, next) => {
  res.send('<h1>Hello, this topics</h1>')
});

export default router;