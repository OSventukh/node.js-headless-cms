import express from 'express';
import routes from './routes.js';

const app = express();

await routes(app);

export default app;
