import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import routes from './routes.js';
import errorHandler from './middlewares/error-handle.js';
import deleteExpiredTokenCron from './cron/deleteExpiredToken.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use('/uploads', express.static(path.join('uploads')));

app.use(
  cors({
    origin: process.env.ACCESS_DOMEN || true,
    credentials: true,
  }),
);

deleteExpiredTokenCron.start();

await routes(app);
app.use(errorHandler);

export default app;
