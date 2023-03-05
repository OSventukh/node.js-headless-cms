import express from 'express';
import cookieParser from 'cookie-parser';
import routes from './routes.js';
import auth from './middlewares/auth.js';
import errorHandler from './middlewares/error-handle.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(auth);
await routes(app);

app.use(errorHandler);

export default app;
