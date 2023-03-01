import express from 'express';
import routes from './routes.js';
import errorHandler from './middlewares/error-handle.js';

const app = express();

app.use(express.json());

await routes(app);

app.use(errorHandler);

export default app;
