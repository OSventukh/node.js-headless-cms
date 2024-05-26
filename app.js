import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import routes from './routes.js';
import errorHandler from './middlewares/error-handle.js';
import deleteExpiredTokenCron from './cron/deleteExpiredToken.js';
import logger from './utils/logger.js';
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use('/uploads', express.static(path.join('uploads')));

app.use(
  cors({
    origin: process.env.ACCESS_DOMEN,
    credentials: true,
  }),
);

deleteExpiredTokenCron.start();

await routes(app);
app.use(errorHandler);

export default app;
